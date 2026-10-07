import os, sqlite3, threading, time, secrets, requests
from flask import Flask, jsonify, request, send_from_directory

BASE = os.path.dirname(os.path.abspath(__file__))
DB = os.path.join(BASE, "anime.db")
TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "")
CHANNEL_ID = os.getenv("TELEGRAM_CHANNEL_ID", "")
PORT = int(os.getenv("PORT", "10000"))

app = Flask(__name__, static_folder=".", static_url_path="")

def db():
    c = sqlite3.connect(DB)
    c.row_factory = sqlite3.Row
    c.execute("""CREATE TABLE IF NOT EXISTS challenges(
        id TEXT PRIMARY KEY, creator TEXT NOT NULL, title TEXT NOT NULL,
        answers TEXT NOT NULL, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)""")
    c.execute("""CREATE TABLE IF NOT EXISTS results(
        id INTEGER PRIMARY KEY AUTOINCREMENT, challenge_id TEXT, name TEXT,
        score INTEGER, total INTEGER, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)""")
    c.commit()
    return c

def tg(method, payload=None):
    if not TOKEN: return None
    try:
        return requests.post(f"https://api.telegram.org/bot{TOKEN}/{method}", json=payload or {}, timeout=15).json()
    except Exception:
        return None

def notify(text):
    if TOKEN and CHANNEL_ID:
        tg("sendMessage", {"chat_id": CHANNEL_ID, "text": text, "disable_web_page_preview": True})

@app.get("/")
def index():
    return send_from_directory(BASE, "index.html")

@app.get("/<path:path>")
def static_files(path):
    return send_from_directory(BASE, path)

@app.get("/api/health")
def health():
    return jsonify({"ok": True, "telegram": bool(TOKEN and CHANNEL_ID)})

@app.post("/api/challenges")
def create_challenge():
    data = request.get_json(silent=True) or {}
    name, title, answers = str(data.get("name","")).strip(), str(data.get("title","")).strip(), data.get("answers")
    if not name or not isinstance(answers, list) or len(answers) != 10:
        return jsonify({"error":"Invalid challenge data"}), 400
    cid = secrets.token_urlsafe(7)
    c = db()
    c.execute("INSERT INTO challenges(id,creator,title,answers) VALUES(?,?,?,?)",
              (cid, name[:40], (title or "How well do you know my anime taste?")[:100], ",".join(map(str,answers))))
    c.commit(); c.close()
    notify(f"⚔️ ANIME BATTLE\n\n{name[:40]} created a new anime challenge.\nChallenge ID: {cid}")
    return jsonify({"id": cid})

@app.get("/api/challenges/<cid>")
def get_challenge(cid):
    c=db(); row=c.execute("SELECT id,creator,title,answers FROM challenges WHERE id=?",(cid,)).fetchone(); c.close()
    if not row: return jsonify({"error":"Challenge not found"}),404
    return jsonify({"id":row["id"],"creator":row["creator"],"title":row["title"]})

@app.post("/api/challenges/<cid>/results")
def result(cid):
    data=request.get_json(silent=True) or {}
    name=str(data.get("name","")).strip()
    score=int(data.get("score",-1))
    total=int(data.get("total",10))
    if not name or score < 0 or score > total: return jsonify({"error":"Invalid result"}),400
    c=db()
    exists=c.execute("SELECT id FROM challenges WHERE id=?",(cid,)).fetchone()
    if not exists: c.close(); return jsonify({"error":"Challenge not found"}),404
    c.execute("INSERT INTO results(challenge_id,name,score,total) VALUES(?,?,?,?)",(cid,name[:40],score,total))
    c.commit()
    rows=c.execute("SELECT name,score,total FROM results WHERE challenge_id=? ORDER BY score DESC, id ASC LIMIT 50",(cid,)).fetchall()
    c.close()
    notify(f"🏆 ANIME BATTLE RESULT\n{name[:40]} scored {score}/{total}\nChallenge: {cid}")
    return jsonify({"leaderboard":[dict(x) for x in rows]})

@app.get("/api/challenges/<cid>/leaderboard")
def leaderboard(cid):
    c=db(); rows=c.execute("SELECT name,score,total FROM results WHERE challenge_id=? ORDER BY score DESC, id ASC LIMIT 50",(cid,)).fetchall(); c.close()
    return jsonify({"leaderboard":[dict(x) for x in rows]})

def bot_loop():
    if not TOKEN: return
    offset=0
    while True:
        try:
            data=tg("getUpdates", {"timeout":25,"offset":offset})
            for u in (data or {}).get("result",[]):
                offset=u["update_id"]+1
                msg=u.get("message",{})
                chat=msg.get("chat",{})
                if msg.get("text","").startswith("/start"):
                    tg("sendMessage",{"chat_id":chat.get("id"),"text":"⚔️ Anime Battle Bot\nCreate an Anime Battle on the website and share it with your friends.\n\nCommands:\n/stats — show recent challenge count"})
                elif msg.get("text","").startswith("/stats"):
                    c=db(); n=c.execute("SELECT COUNT(*) FROM challenges").fetchone()[0]; r=c.execute("SELECT COUNT(*) FROM results").fetchone()[0]; c.close()
                    tg("sendMessage",{"chat_id":chat.get("id"),"text":f"📊 Anime Battle\nChallenges: {n}\nResults: {r}"})
        except Exception:
            time.sleep(3)

threading.Thread(target=bot_loop, daemon=True).start()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=PORT)
