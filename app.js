const Q = [
["Which anime world would you choose to live in?",["One Piece","Naruto","Jujutsu Kaisen","Demon Slayer"]],
["Pick your ultimate anime power.",["Sharingan","Devil Fruit","Domain Expansion","Nen"]],
["Who would be your teammate?",["Gojo","Kakashi","Zoro","Tanjiro"]],
["Which vibe fits you best?",["Chaotic hero","Silent strategist","Overpowered legend","Loyal fighter"]],
["What would you do in an anime battle?",["Rush in","Make a plan","Wait for the perfect moment","Protect my friends"]],
["Choose a training arc.",["Mountain training","Sword training","Tournament arc","Secret master"]],
["Which anime food would you try first?",["Ichiraku Ramen","Sanji's feast","Akaza's bento","Goku's giant meal"]],
["Pick your anime rival.",["Sasuke","Bakugo","Vegeta","Megumi"]],
["What makes an anime unforgettable?",["Story","Characters","Fights","Emotional moments"]],
["Final choice: who is your anime GOAT?",["Naruto","Luffy","Goku","Gojo"]]
];

const API = window.ANIME_API_URL || "";
const app = {
  d:{},
  esc(s){return String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]))},
  home(){history.replaceState({}, "", location.pathname); this.renderHome()},
  async init(){const id=new URLSearchParams(location.search).get("challenge"); id ? await this.join(id) : this.renderHome()},
  renderHome(){
    document.querySelector("#app").innerHTML=`
      <section class="hero"><div class="eyebrow">⚡ FRIENDS · ANIME · COMPETITION</div>
      <h1>ANIME <em>BATTLE</em></h1>
      <p>Create an anime challenge, send it to your friends, and discover who actually understands your anime soul.</p>
      <div class="actions"><button class="btn" onclick="app.create()">CREATE CHALLENGE</button><button class="btn secondary" onclick="app.joinForm()">JOIN CHALLENGE</button></div></section>
      <section class="grid"><div class="card"><div class="icon">⚔️</div><h3>Create your battle</h3><p>Answer 10 anime questions.</p></div><div class="card"><div class="icon">🔗</div><h3>Send the link</h3><p>Share one challenge link with friends.</p></div><div class="card"><div class="icon">🏆</div><h3>Global rankings</h3><p>Results are stored by the backend and shared across devices.</p></div></section>`;
  },
  create(){
    document.querySelector("#app").innerHTML=`
      <section class="shell"><div class="card"><h2>Create your challenge</h2>
      <p class="sub">Your answer key stays on the backend and is not put in the invite URL.</p>
      <div class="field"><label>YOUR NAME / NICKNAME</label><input id="name" class="input" maxlength="24" placeholder="e.g. Dhanush"></div>
      <div class="field"><label>CHALLENGE TITLE</label><input id="title" class="input" maxlength="55" value="How well do you know my anime taste?"></div>
      <button class="btn" onclick="app.beginCreator()">START ANSWERING →</button></div></section>`;
  },
  beginCreator(){
    const n=document.querySelector("#name").value.trim();
    if(!n)return alert("Enter your name first.");
    this.d={name:n,title:document.querySelector("#title").value.trim(),answers:[]};
    this.ask(0);
  },
  ask(i){
    const q=Q[i];
    document.querySelector("#app").innerHTML=`
      <section class="shell"><div class="card"><div class="qnum">QUESTION ${i+1} / ${Q.length}</div>
      <div class="progress"><i style="width:${i/Q.length*100}%"></i></div>
      <div class="question">${this.esc(q[0])}</div>
      <div class="answers">${q[1].map((x,j)=>`<div class="answer" onclick="app.pick(${i},${j})">${this.esc(x)}</div>`).join("")}</div>
      <p class="sub">Choose one answer.</p></div></section>`;
  },
  pick(i,j){this.d.answers[i]=j;setTimeout(()=>i+1<Q.length?this.ask(i+1):this.doneCreator(),130)},
  async doneCreator(){
    try{
      const r=await fetch(API+"/api/challenges",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name:this.d.name,title:this.d.title,answers:this.d.answers})});
      if(!r.ok)throw new Error();
      const x=await r.json();this.d.id=x.id;
      const url=location.href.split("?")[0]+"?challenge="+encodeURIComponent(x.id);
      document.querySelector("#app").innerHTML=`
        <section class="shell"><div class="card score"><div class="eyebrow">CHALLENGE READY ⚡</div><h2>Your battle is live.</h2>
        <p class="sub">${this.esc(this.d.name)}, send this link to your friends.</p>
        <div class="share"><input id="link" class="input" readonly value="${url}"><button class="btn" style="width:auto" onclick="app.copy()">COPY</button></div>
        <div style="height:10px"></div><button class="btn secondary" onclick="app.share()">SHARE WITH FRIENDS</button>
        <div style="height:10px"></div><button class="btn secondary" onclick="app.home()">BACK HOME</button></div></section>`;
    }catch(e){alert("Backend not connected. Deploy the Telegram backend first.");}
  },
  joinForm(){
    document.querySelector("#app").innerHTML=`
      <section class="shell"><div class="card"><h2>Join a challenge</h2><p class="sub">Paste the challenge link your friend sent you.</p>
      <div class="field"><input id="joinurl" class="input" placeholder="https://your-site.com/?challenge=..."></div>
      <button class="btn" onclick="app.openJoin()">JOIN →</button></div></section>`;
  },
  openJoin(){
    try{const u=new URL(document.querySelector("#joinurl").value.trim());const id=u.searchParams.get("challenge");if(!id)throw 1;location.href="?challenge="+encodeURIComponent(id)}
    catch(e){alert("That challenge link is not valid.")}
  },
  async join(id){
    try{
      const r=await fetch(API+"/api/challenges/"+encodeURIComponent(id));if(!r.ok)throw 1;
      const x=await r.json();this.d={id:x.id,name:x.creator,title:x.title,answers:[]};
      document.querySelector("#app").innerHTML=`
        <section class="shell"><div class="card"><div class="eyebrow">⚔ FRIEND CHALLENGE</div>
        <h2>${this.esc(x.creator)} challenged you.</h2><p class="sub">${this.esc(x.title)}</p>
        <div class="field"><label>YOUR NAME / NICKNAME</label><input id="friend" class="input" placeholder="Your name"></div>
        <button class="btn" onclick="app.beginFriend()">ACCEPT CHALLENGE →</button></div></section>`;
    }catch(e){document.querySelector("#app").innerHTML=`<section class="shell"><div class="card"><h2>Challenge unavailable</h2><p class="sub">This challenge does not exist or the backend is offline.</p><button class="btn" onclick="app.home()">GO HOME</button></div></section>`;}
  },
  beginFriend(){const n=document.querySelector("#friend").value.trim();if(!n)return alert("Enter your name.");this.d.friend=n;this.askFriend(0)},
  askFriend(i){
    const q=Q[i];
    document.querySelector("#app").innerHTML=`
      <section class="shell"><div class="card"><div class="qnum">QUESTION ${i+1} / ${Q.length}</div>
      <div class="progress"><i style="width:${i/Q.length*100}%"></i></div><div class="question">${this.esc(q[0])}</div>
      <div class="answers">${q[1].map((x,j)=>`<div class="answer" onclick="app.pickFriend(${i},${j})">${this.esc(x)}</div>`).join("")}</div></div></section>`;
  },
  pickFriend(i,j){this.d.answers[i]=j;setTimeout(()=>i+1<Q.length?this.askFriend(i+1):this.finish(),130)},
  async finish(){
    try{
      const r=await fetch(API+"/api/challenges/"+encodeURIComponent(this.d.id)+"/answer-key");
      if(!r.ok)throw new Error();
      const x=await r.json();const score=this.d.answers.reduce((s,a,i)=>s+(a===x.answers[i]?1:0),0);
      const pct=Math.round(score/Q.length*100);
      const rank=pct>=90?"ANIME SOULMATE":pct>=70?"CERTIFIED SENPAI":pct>=50?"ARC PARTICIPANT":"CASUAL WATCHER";
      await fetch(API+"/api/challenges/"+encodeURIComponent(this.d.id)+"/results",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name:this.d.friend,score,total:Q.length})});
      this.d.score=score;
      document.querySelector("#app").innerHTML=`
        <section class="shell"><div class="card score"><div class="eyebrow">BATTLE COMPLETE ⚡</div>
        <div class="ring" style="--pct:${pct}%"><div><div class="big">${score}/${Q.length}</div><small>SYNC</small></div></div>
        <div class="rank">${rank}</div><p class="sub">You and ${this.esc(this.d.name)} are ${pct}% anime-synced.</p>
        <button class="btn" onclick="app.shareResult()">SHARE MY SCORE</button><div style="height:10px"></div>
        <button class="btn secondary" onclick="app.leaderboard()">VIEW LEADERBOARD</button></div></section>`;
    }catch(e){alert("Could not submit the result. Please try again.");}
  },
  async leaderboard(){
    try{
      const r=await fetch(API+"/api/challenges/"+encodeURIComponent(this.d.id)+"/leaderboard");if(!r.ok)throw 1;
      const list=(await r.json()).leaderboard||[];
      document.querySelector("#app").innerHTML=`
        <section class="shell"><div class="card"><div class="eyebrow">🏆 BATTLE RANKINGS</div>
        <h2>Who knows ${this.esc(this.d.name)} best?</h2>
        ${list.length?list.map((x,i)=>`<div class="row"><span class="num">#${i+1}</span><strong>${this.esc(x.name)}</strong><span class="pill">${x.score}/${x.total}</span></div>`).join(""):"<p class='sub'>No scores yet.</p>"}
        <div style="height:18px"></div><button class="btn secondary" onclick="app.home()">CREATE YOUR OWN</button></div></section>`;
    }catch(e){alert("Leaderboard is unavailable.");}
  },
  async copy(){await navigator.clipboard.writeText(document.querySelector("#link").value);alert("Challenge link copied!")},
  async share(){const u=document.querySelector("#link").value;if(navigator.share)await navigator.share({title:"Anime Battle",text:"Think you know my anime taste? Take my challenge ⚔️",url:u});else this.copy()},
  async shareResult(){const t="I just took an Anime Battle ⚔️ Can you beat my score?";if(navigator.share)await navigator.share({title:"Anime Battle",text:t,url:location.href});else{await navigator.clipboard.writeText(t+" "+location.href);alert("Share text copied!")}}
};
app.init();