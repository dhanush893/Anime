const IMG={
  crossover:"https://primetimeanime.com/images/blog/best-action-anime-ranked.jpg",
  naruto:"https://www.tv-tokyo.co.jp/anime/naruto/images/chara/chara_01_1.png",
  gojo:"https://i3.ruliweb.com/img/22/12/17/1851e52fe7434d9e5.jpg",
  tanjiro:"https://shapes.inc/_next/image?q=75&url=https%3A%2F%2Fsxhodsrixg8meuri.public.blob.vercel-storage.com%2Ffandom-lore%2Fcharacters%2Fdemon-slayer-kimetsu-no-yaiba%2Ftanjiro-kamado-b7cd0978b9e2.jpg&w=1200"
};
const Q=[
["Which anime features the Hidden Leaf Village?",["Naruto","One Piece","Bleach","Demon Slayer"],"naruto","NARUTO"],
["What is Luffy's dream in One Piece?",["Become Pirate King","Become Hokage","Become a Hashira","Become a Sorcerer"],"crossover","ONE PIECE"],
["What is Gojo's signature ability?",["Limitless","Bankai","Nen","Breathing Style"],"gojo","JUJUTSU KAISEN"],
["Who carries Nezuko in a wooden box?",["Tanjiro","Zenitsu","Inosuke","Giyu"],"tanjiro","DEMON SLAYER"],
["Which character is known for the Sharingan?",["Sasuke","Zoro","Gojo","Tanjiro"],"naruto","NARUTO"],
["Which crew does Luffy lead?",["Straw Hat Pirates","Akatsuki","Team 7","Demon Slayer Corps"],"crossover","ONE PIECE"],
["What is the name of the school in Jujutsu Kaisen?",["Tokyo Jujutsu High","UA High","Ninja Academy","Soul Society"],"gojo","JUJUTSU KAISEN"],
["What weapon does a Demon Slayer commonly use?",["Nichirin Sword","Kunai","Devil Fruit","Cursed Tool only"],"tanjiro","DEMON SLAYER"],
["Who is Naruto's teacher in Team 7?",["Kakashi","Jiraiya","Iruka","Might Guy"],"naruto","NARUTO"],
["Final battle pick: which hero would you trust most?",["Naruto","Luffy","Gojo","Tanjiro"],"crossover","FINAL ROUND"]
];
const API=window.ANIME_API_URL||"";
const app={
d:{},
esc(s){return String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]))},
home(){history.replaceState({}, "", location.pathname);this.renderHome()},
async init(){const id=new URLSearchParams(location.search).get("challenge");id?await this.join(id):this.renderHome()},
renderHome(){
document.querySelector("#app").innerHTML=`
<section class="hero">
<div class="eyebrow">⚡ ANIME QUIZ · FRIENDS · COMPETITION</div>
<div class="hero-art">
<img src="${IMG.crossover}" alt="Anime battle artwork">
<div class="hero-art-copy"><b>WHO KNOWS ANIME BEST?</b><small>Pick answers · challenge friends · climb the leaderboard</small></div>
<span class="spark" style="left:20%;top:22%"></span><span class="spark" style="left:74%;top:30%;animation-delay:1s"></span>
</div>
<h1>ANIME <em>BATTLE</em></h1>
<p>Create an anime challenge with character visuals, animated questions, and a live leaderboard. Send one link to your friends and find your ultimate anime match.</p>
<div class="actions"><button class="btn" onclick="app.create()">CREATE CHALLENGE</button><button class="btn secondary" onclick="app.joinForm()">JOIN CHALLENGE</button></div>
</section>
<section class="grid">
<div class="card"><div class="icon">🌀</div><h3>Character visuals</h3><p>Naruto, Luffy, Gojo and Tanjiro appear throughout the quiz.</p></div>
<div class="card"><div class="icon">✨</div><h3>Animated quiz</h3><p>Glow, scanlines, particles, image motion and smooth question transitions.</p></div>
<div class="card"><div class="icon">🏆</div><h3>Friend rankings</h3><p>Share one challenge URL and compare everyone's anime score.</p></div>
</section>`;
},
create(){document.querySelector("#app").innerHTML=`
<section class="shell"><div class="card"><h2>Create your challenge</h2><p class="sub">Choose the answers you think your friends will match. The anime visuals make every question feel like a mini battle.</p>
<div class="field"><label>YOUR NAME / NICKNAME</label><input id="name" class="input" maxlength="24" placeholder="e.g. Dhanush"></div>
<div class="field"><label>CHALLENGE TITLE</label><input id="title" class="input" maxlength="55" value="How well do you know my anime taste?"></div>
<button class="btn" onclick="app.beginCreator()">START ANIME BATTLE →</button></div></section>`},
beginCreator(){const n=document.querySelector("#name").value.trim();if(!n)return alert("Enter your name first.");this.d={name:n,title:document.querySelector("#title").value.trim(),answers:[]};this.ask(0)},
ask(i){const q=Q[i];document.querySelector("#app").innerHTML=`
<section class="shell"><div class="card"><div class="qnum">QUESTION ${i+1} / ${Q.length}</div><div class="progress"><i style="width:${i/Q.length*100}%"></i></div>
<div class="question-media"><img src="${IMG[q[2]]}" alt="${this.esc(q[3])} character visual"><div class="question-tag">${q[3]} · ANIME BATTLE</div></div>
<div class="question">${this.esc(q[0])}</div><div class="answers">${q[1].map((x,j)=>`<div class="answer" style="animation-delay:${j*45}ms" onclick="app.pick(${i},${j})">${this.esc(x)}</div>`).join("")}</div>
<p class="sub">Pick the answer your friends should match.</p></div></section>`},
pick(i,j){this.d.answers[i]=j;setTimeout(()=>i+1<Q.length?this.ask(i+1):this.doneCreator(),180)},
async doneCreator(){try{const r=await fetch(API+"/api/challenges",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name:this.d.name,title:this.d.title,answers:this.d.answers})});if(!r.ok)throw new Error();const x=await r.json();this.d.id=x.id;const url=location.href.split("?")[0]+"?challenge="+encodeURIComponent(x.id);document.querySelector("#app").innerHTML=`
<section class="shell"><div class="card score"><div class="eyebrow">CHALLENGE READY ⚡</div><h2>Your anime battle is live.</h2><p class="sub">${this.esc(this.d.name)}, send this link to your friends.</p><div class="share"><input id="link" class="input" readonly value="${url}"><button class="btn" style="width:auto" onclick="app.copy()">COPY</button></div><div style="height:10px"></div><button class="btn secondary" onclick="app.share()">SHARE WITH FRIENDS</button><div style="height:10px"></div><button class="btn secondary" onclick="app.home()">BACK HOME</button></div></section>`}catch(e){alert("Backend not connected. Please check the Koyeb service.");}},
joinForm(){document.querySelector("#app").innerHTML=`<section class="shell"><div class="card"><h2>Join a challenge</h2><p class="sub">Paste the challenge link your friend sent you.</p><div class="field"><input id="joinurl" class="input" placeholder="https://your-site.com/?challenge=..."></div><button class="btn" onclick="app.openJoin()">JOIN →</button></div></section>`},
openJoin(){try{const u=new URL(document.querySelector("#joinurl").value.trim());const id=u.searchParams.get("challenge");if(!id)throw 1;location.href="?challenge="+encodeURIComponent(id)}catch(e){alert("That challenge link is not valid.")}},
async join(id){try{const r=await fetch(API+"/api/challenges/"+encodeURIComponent(id));if(!r.ok)throw 1;const x=await r.json();this.d={id:x.id,name:x.creator,title:x.title,answers:[]};document.querySelector("#app").innerHTML=`
<section class="shell"><div class="card"><div class="eyebrow">⚔ FRIEND ANIME CHALLENGE</div><h2>${this.esc(x.creator)} challenged you.</h2><p class="sub">${this.esc(x.title)}</p><div class="field"><label>YOUR NAME / NICKNAME</label><input id="friend" class="input" placeholder="Your name"></div><button class="btn" onclick="app.beginFriend()">ACCEPT CHALLENGE →</button></div></section>`}catch(e){document.querySelector("#app").innerHTML=`<section class="shell"><div class="card"><h2>Challenge unavailable</h2><p class="sub">This challenge does not exist or the backend is offline.</p><button class="btn" onclick="app.home()">GO HOME</button></div></section>`}},
beginFriend(){const n=document.querySelector("#friend").value.trim();if(!n)return alert("Enter your name.");this.d.friend=n;this.askFriend(0)},
askFriend(i){const q=Q[i];document.querySelector("#app").innerHTML=`
<section class="shell"><div class="card"><div class="qnum">QUESTION ${i+1} / ${Q.length}</div><div class="progress"><i style="width:${i/Q.length*100}%"></i></div>
<div class="question-media"><img src="${IMG[q[2]]}" alt="${this.esc(q[3])} character visual"><div class="question-tag">${q[3]} · VISUAL ROUND</div></div>
<div class="question">${this.esc(q[0])}</div><div class="answers">${q[1].map((x,j)=>`<div class="answer" style="animation-delay:${j*45}ms" onclick="app.pickFriend(${i},${j})">${this.esc(x)}</div>`).join("")}</div></div></section>`},
pickFriend(i,j){this.d.answers[i]=j;setTimeout(()=>i+1<Q.length?this.askFriend(i+1):this.finish(),180)},
async finish(){try{const r=await fetch(API+"/api/challenges/"+encodeURIComponent(this.d.id)+"/answer-key");if(!r.ok)throw new Error();const x=await r.json();const score=this.d.answers.reduce((s,a,i)=>s+(a===x.answers[i]?1:0),0);const pct=Math.round(score/Q.length*100);const rank=pct>=90?"ANIME SOULMATE":pct>=70?"CERTIFIED SENPAI":pct>=50?"ARC PARTICIPANT":"CASUAL WATCHER";await fetch(API+"/api/challenges/"+encodeURIComponent(this.d.id)+"/results",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name:this.d.friend,score,total:Q.length})});this.d.score=score;document.querySelector("#app").innerHTML=`
<section class="shell"><div class="card score"><div class="eyebrow">BATTLE COMPLETE ⚡</div><div class="ring" style="--pct:${pct}%"><div><div class="big">${score}/${Q.length}</div><small>SYNC</small></div></div><div class="rank">${rank}</div><p class="sub">You and ${this.esc(this.d.name)} are ${pct}% anime-synced.</p><button class="btn" onclick="app.shareResult()">SHARE MY SCORE</button><div style="height:10px"></div><button class="btn secondary" onclick="app.leaderboard()">VIEW LEADERBOARD</button></div></section>`}catch(e){alert("Could not submit the result. Please try again.")}},
async leaderboard(){try{const r=await fetch(API+"/api/challenges/"+encodeURIComponent(this.d.id)+"/leaderboard");if(!r.ok)throw 1;const list=(await r.json()).leaderboard||[];document.querySelector("#app").innerHTML=`
<section class="shell"><div class="card"><div class="eyebrow">🏆 BATTLE RANKINGS</div><h2>Who knows ${this.esc(this.d.name)} best?</h2>${list.length?list.map((x,i)=>`<div class="row"><span class="num">#${i+1}</span><strong>${this.esc(x.name)}</strong><span class="pill">${x.score}/${x.total}</span></div>`).join(""):"<p class='sub'>No scores yet.</p>"}<div style="height:18px"></div><button class="btn secondary" onclick="app.home()">CREATE YOUR OWN</button></div></section>`}catch(e){alert("Leaderboard is unavailable.")}},
async copy(){await navigator.clipboard.writeText(document.querySelector("#link").value);alert("Challenge link copied!")},async share(){const u=document.querySelector("#link").value;if(navigator.share)await navigator.share({title:"Anime Battle",text:"Think you know my anime taste? Take my challenge ⚔️",url:u});else this.copy()},async shareResult(){const t="I just took an Anime Battle ⚔️ Can you beat my score?";if(navigator.share)await navigator.share({title:"Anime Battle",text:t,url:location.href});else{await navigator.clipboard.writeText(t+" "+location.href);alert("Share text copied!")}}
};
app.init();