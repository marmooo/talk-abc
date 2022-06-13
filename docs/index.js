const replyPlease=document.getElementById("replyPlease"),reply=document.getElementById("reply"),playPanel=document.getElementById("playPanel"),countPanel=document.getElementById("countPanel"),scorePanel=document.getElementById("scorePanel"),gameTime=180,alphabet="ABCDEFGHIJKLMNOPQRSTUVWXYZ";let problemCandidate=Array.from(alphabet),answer="Talk ABC",firstRun=!0,catCounter=0,solveCount=0;const correctArray=new Array(26).fill(0),incorrectArray=new Array(26).fill(0),scoreChart=initChart();let englishVoices=[];const voiceInput=setVoiceInput();let endAudio,errorAudio,correctAudio;loadAudios();const AudioContext=window.AudioContext||window.webkitAudioContext,audioContext=new AudioContext;loadConfig();function loadConfig(){if(localStorage.getItem("darkMode")==1&&(document.documentElement.dataset.theme="dark"),localStorage.getItem("voice")==0&&(document.getElementById("voiceOn").classList.remove("d-none"),document.getElementById("voiceOff").classList.add("d-none")),localStorage.getItem("furigana")==1){const a=document.getElementById("addFurigana");addFurigana(a),a.setAttribute("data-done",!0)}}function toggleDarkMode(){localStorage.getItem("darkMode")==1?(localStorage.setItem("darkMode",0),delete document.documentElement.dataset.theme):(localStorage.setItem("darkMode",1),document.documentElement.dataset.theme="dark")}function addFurigana(){const a=document.getElementById("addFurigana");a.getAttribute("data-done")?(localStorage.setItem("furigana",0),location.reload()):(import("https://marmooo.github.io/yomico/yomico.min.js").then(a=>{a.yomico("index.yomi")}),localStorage.setItem("furigana",1),a.setAttribute("data-done",!0))}function toggleVoice(){localStorage.getItem("voice")!=0?(localStorage.setItem("voice",0),document.getElementById("voiceOn").classList.add("d-none"),document.getElementById("voiceOff").classList.remove("d-none"),speechSynthesis.cancel()):(localStorage.setItem("voice",1),document.getElementById("voiceOn").classList.remove("d-none"),document.getElementById("voiceOff").classList.add("d-none"),voiceInput.stop(),speak(answer.toLowerCase()))}function playAudio(c,b){const a=audioContext.createBufferSource();if(a.buffer=c,b){const c=audioContext.createGain();c.gain.value=b,c.connect(audioContext.destination),a.connect(c),a.start()}else a.connect(audioContext.destination),a.start()}function unlockAudio(){audioContext.resume()}function loadAudio(a){return fetch(a).then(a=>a.arrayBuffer()).then(a=>new Promise((b,c)=>{audioContext.decodeAudioData(a,a=>{b(a)},a=>{c(a)})}))}function loadAudios(){promises=[loadAudio("mp3/end.mp3"),loadAudio("mp3/cat.mp3"),loadAudio("mp3/incorrect1.mp3"),loadAudio("mp3/correct3.mp3")],Promise.all(promises).then(a=>{endAudio=a[0],errorAudio=a[1],incorrectAudio=a[2],correctAudio=a[3]})}function loadVoices(){const a=new Promise(b=>{let a=speechSynthesis.getVoices();if(a.length!==0)b(a);else{let c=!1;speechSynthesis.addEventListener("voiceschanged",()=>{c=!0,a=speechSynthesis.getVoices(),b(a)}),setTimeout(()=>{c||document.getElementById("noTTS").classList.remove("d-none")},1e3)}});a.then(a=>{englishVoices=a.filter(a=>a.lang=="en-US")})}loadVoices();function speak(b){speechSynthesis.cancel();const a=new SpeechSynthesisUtterance(b);a.onend=()=>{voiceInput.start()},a.voice=englishVoices[Math.floor(Math.random()*englishVoices.length)],a.lang="en-US",voiceInput.stop(),speechSynthesis.speak(a)}function respeak(){speak(answer.toLowerCase())}function getRandomInt(a,b){return a=Math.ceil(a),b=Math.floor(b),Math.floor(Math.random()*(b-a)+a)}function hideAnswer(){document.getElementById("reply").textContent=""}function nextProblem(){hideAnswer(),firstRun?firstRun=!1:(updateChart(scoreChart,0,alphabet.indexOf(answer)),solveCount+=1),answer=problemCandidate.splice(getRandomInt(0,problemCandidate.length),1)[0],problemCandidate.length<=0&&(problemCandidate=Array.from(alphabet)),document.getElementById("answer").textContent=answer,localStorage.getItem("voice")!=0&&speak(answer.toLowerCase())}function catNyan(){playAudio(errorAudio)}function loadImage(a){return new Promise((c,d)=>{const b=new Image;b.onload=()=>c(b),b.onerror=a=>d(a),b.src=a})}function loadCatImage(b){const a=128;return new Promise(c=>{loadImage(b).then(d=>{const b=document.createElement("canvas");b.width=a,b.height=a,b.style.position="absolute",b.getContext("2d").drawImage(d,0,0),c(b)}).catch(a=>{console.log(a)})})}loadCatImage("kohacu.webp").then(a=>{catsWalk(a)});function catWalk(g,d){const c=document.getElementById("catsWalk"),e=c.offsetWidth,f=c.offsetHeight,a=d.cloneNode(!0);a.getContext("2d").drawImage(d,0,0);const b=128;a.style.top=getRandomInt(0,f-b)+"px",a.style.left=e-b+"px",a.addEventListener("click",()=>{speak(alphabet[catCounter].toLowerCase()),catCounter>=alphabet.length-1?catCounter=0:catCounter+=1,a.remove()},{once:!0}),c.appendChild(a);const h=setInterval(()=>{const c=parseInt(a.style.left)-1;c>-b?a.style.left=c+"px":(clearInterval(h),a.remove())},g)}function catsWalk(a){setInterval(()=>{Math.random()>.995&&catWalk(getRandomInt(5,20),a)},10)}let gameTimer;function startGameTimer(){clearInterval(gameTimer);const a=document.getElementById("time");initTime(),gameTimer=setInterval(()=>{const b=parseInt(a.textContent);b>0?a.textContent=b-1:(clearInterval(gameTimer),playAudio(endAudio),scoring())},1e3)}let countdownTimer;function countdown(){solveCount=0,clearTimeout(countdownTimer),countPanel.classList.remove("d-none"),playPanel.classList.add("d-none"),scorePanel.classList.add("d-none");const a=document.getElementById("counter");a.textContent=3,countdownTimer=setInterval(()=>{const b=["skyblue","greenyellow","violet","tomato"];if(parseInt(a.textContent)>1){const c=parseInt(a.textContent)-1;a.style.backgroundColor=b[c],a.textContent=c}else clearTimeout(countdownTimer),countPanel.classList.add("d-none"),playPanel.classList.remove("d-none"),solveCount=0,document.getElementById("score").textContent=0,nextProblem(),startGameTimer()},1e3)}function initTime(){document.getElementById("time").textContent=gameTime}function scoring(){playPanel.classList.add("d-none"),scorePanel.classList.remove("d-none"),document.getElementById("score").textContent=solveCount}function updateChart(a,b,c){b==0?(correctArray[c]+=1,a.data.datasets[b].data=correctArray.slice()):(incorrectArray[c]+=1,a.data.datasets[b].data=incorrectArray.slice()),a.update()}function initChart(){const a={labels:Array.from(alphabet),datasets:[{label:"OK",data:new Array(alphabet.length),borderColor:"rgba(0,0,255,1)",backgroundColor:"rgba(0,0,255,0.5)"},{label:"NG",data:new Array(alphabet.length),borderColor:"rgba(255,0,0,1)",backgroundColor:"rgba(255,0,0,0.5)"}]},b={type:"bar",data:a,options:{responsive:!0,aspectRatio:4,plugins:{legend:{position:"top"},title:{display:!1,text:"正答数 / 誤答数"}}}};return new Chart(document.getElementById("chart"),b)}function formatReply(a){switch(a=a.toLowerCase(),a){case"hey":return"a";case"be":return"b";case"sea":case"see":return"c";case"jay":return"j";case"oh":return"o";case"ar":return"r";case"you":return"u";case"why":return"y";case"light":case"fly":case"lead":case"play":case"lice":case"glass":case"liver":case"load":case"long":return"l";case"right":case"fry":case"read":case"pray":case"rice":case"grass":case"river":case"road":case"wrong":return"r"}return a}function setVoiceInput(){if("webkitSpeechRecognition"in window){const a=new webkitSpeechRecognition;return a.lang="en-US",a.continuous=!0,a.onstart=()=>voiceInputOnStart,a.onend=()=>{speechSynthesis.speaking||a.start()},a.onresult=c=>{const b=c.results[0][0].transcript;document.getElementById("reply").textContent=b,formatReply(b)==answer.toLowerCase()?(playAudio(correctAudio),nextProblem()):updateChart(scoreChart,1,alphabet.indexOf(answer)),replyPlease.classList.add("d-none"),reply.classList.remove("d-none"),a.stop()},a}else document.getElementById("noSTT").classList.remove("d-none")}function voiceInputOnStart(){document.getElementById("startVoiceInput").classList.add("d-none"),document.getElementById("stopVoiceInput").classList.remove("d-none")}function voiceInputOnStop(){document.getElementById("startVoiceInput").classList.remove("d-none"),document.getElementById("stopVoiceInput").classList.add("d-none")}function startVoiceInput(){voiceInput.start()}function stopVoiceInput(){voiceInput.start(),voiceInput.stop()}document.getElementById("toggleDarkMode").onclick=toggleDarkMode,document.getElementById("addFurigana").onclick=addFurigana,document.getElementById("toggleVoice").onclick=toggleVoice,document.getElementById("restartButton").onclick=countdown,document.getElementById("startButton").onclick=countdown,document.getElementById("respeak").onclick=respeak,document.getElementById("startVoiceInput").onclick=startVoiceInput,document.getElementById("stopVoiceInput").onclick=stopVoiceInput,document.getElementById("kohacu").onclick=catNyan,[...document.getElementById("lr").getElementsByTagName("td")].forEach(a=>{a.onclick=()=>{speak(a.firstElementChild.textContent)}}),document.addEventListener("click",unlockAudio,{once:!0,useCapture:!0})