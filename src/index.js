let endAudio, errorAudio, incorrectAudio, correctAudio;
loadAudios();
const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioContext = new AudioContext();
const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
let problemCandidate = Array.from(alphabet);
let voiceInput = null;
let answer = 'Talk ABC';
let firstRun = true;
let catCounter = 0;
let solveCount = 0;
let correctArray = new Array(26).fill(0);
let incorrectArray = new Array(26).fill(0);
let englishVoices = [];
let scoreChart = initChart();


function loadConfig() {
  if (localStorage.getItem('darkMode') == 1) {
    document.documentElement.dataset.theme = 'dark';
  }
  if (localStorage.getItem('voice') == 0) {
    document.getElementById('voiceOn').classList.remove('d-none');
    document.getElementById('voiceOff').classList.add('d-none');
  }
}
loadConfig();

function toggleDarkMode() {
  if (localStorage.getItem('darkMode') == 1) {
    localStorage.setItem('darkMode', 0);
    delete document.documentElement.dataset.theme;
  } else {
    localStorage.setItem('darkMode', 1);
    document.documentElement.dataset.theme = 'dark';
  }
}

function toggleVoice(obj) {
  if (localStorage.getItem('voice') != 0) {
    localStorage.setItem('voice', 0);
    document.getElementById('voiceOn').classList.add('d-none');
    document.getElementById('voiceOff').classList.remove('d-none');
    speechSynthesis.cancel();
  } else {
    localStorage.setItem('voice', 1);
    document.getElementById('voiceOn').classList.remove('d-none');
    document.getElementById('voiceOff').classList.add('d-none');
    voiceInput.stop();
    speak(answer);
  }
}

function playAudio(audioBuffer, volume) {
  const audioSource = audioContext.createBufferSource();
  audioSource.buffer = audioBuffer;
  if (volume) {
    const gainNode = audioContext.createGain();
    gainNode.gain.value = volume;
    gainNode.connect(audioContext.destination);
    audioSource.connect(gainNode);
    audioSource.start();
  } else {
    audioSource.connect(audioContext.destination);
    audioSource.start();
  }
}

function unlockAudio() {
  audioContext.resume();
}

function loadAudio(url) {
  return fetch(url)
    .then(response => response.arrayBuffer())
    .then(arrayBuffer => {
      return new Promise((resolve, reject) => {
        audioContext.decodeAudioData(arrayBuffer, (audioBuffer) => {
          resolve(audioBuffer);
        }, (err) => {
          reject(err);
        });
      });
    });
}

function loadAudios() {
  promises = [
    loadAudio('mp3/end.mp3'),
    loadAudio('mp3/cat.mp3'),
    loadAudio('mp3/incorrect1.mp3'),
    loadAudio('mp3/correct3.mp3'),
  ];
  Promise.all(promises).then(audioBuffers => {
    endAudio = audioBuffers[0];
    errorAudio = audioBuffers[1];
    incorrectAudio = audioBuffers[2];
    correctAudio = audioBuffers[3];
  });
}

function loadVoices() {
  // https://stackoverflow.com/questions/21513706/
  const allVoicesObtained = new Promise(function(resolve, reject) {
    let voices = speechSynthesis.getVoices();
    if (voices.length !== 0) {
      resolve(voices);
    } else {
      speechSynthesis.addEventListener("voiceschanged", function() {
        voices = speechSynthesis.getVoices();
        resolve(voices);
      });
    }
  });
  allVoicesObtained.then(voices => {
    englishVoices = voices.filter(voice => voice.lang == 'en-US');
    voiceInput = setVoiceInput();
  });
}
loadVoices();

function speak(text) {
  speechSynthesis.cancel();
  const msg = new SpeechSynthesisUtterance(text);
  msg.onend = () => { voiceInput.start() };
  msg.voice = englishVoices[Math.floor(Math.random() * englishVoices.length)];
  msg.lang = 'en-US';
  voiceInput.stop();
  speechSynthesis.speak(msg);
}

function respeak() {
  speak(answer);
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min);
}

function hideAnswer() {
  document.getElementById('reply').textContent = '';
}

function nextProblem() {
  hideAnswer();
  answer = problemCandidate.splice(getRandomInt(0, problemCandidate.length), 1)[0];
  if (problemCandidate.length <= 0) {
    problemCandidate = Array.from(alphabet);
  }
  document.getElementById('answer').textContent = answer;
  if (localStorage.getItem('voice') != 0) {
    speak(answer);
  }
  if (firstRun) {
    firstRun = false;
  } else {
    updateChart(scoreChart, 0, alphabet.indexOf(answer));
    solveCount += 1;
  }
}

function catNyan() {
  playAudio(errorAudio);
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = src;
  });
}

function loadCatImage(url) {
  const imgSize = 128;
  return new Promise((resolve, reject) => {
    loadImage(url).then(originalImg => {
      const canvas = document.createElement('canvas');
      canvas.width = imgSize;
      canvas.height = imgSize;
      canvas.style.position = 'absolute';
      // drawImage() faster than putImageData()
      canvas.getContext('2d').drawImage(originalImg, 0, 0);
      resolve(canvas);
    }).catch(e => {
      console.log(e);
    });
  });
}
loadCatImage('kohacu.webp').then(catCanvas => {
  catsWalk(100, catCanvas);
});

function catWalk(freq, catCanvas) {
  const area = document.getElementById('catsWalk');
  const width = area.offsetWidth;
  const height = area.offsetHeight;
  const canvas = catCanvas.cloneNode(true);
  canvas.getContext('2d').drawImage(catCanvas, 0, 0);
  const size = 128;
  canvas.style.top = getRandomInt(0, height - size) + 'px';
  canvas.style.left = width - size + 'px';
  canvas.addEventListener('click', function() {
    speak(alphabet[catCounter]);
    if (catCounter >= alphabet.length - 1) {
      catCounter = 0;
    } else {
      catCounter += 1;
    }
    this.remove();
  }, { once:true });
  area.appendChild(canvas);
  const timer = setInterval(function() {
    const x = parseInt(canvas.style.left) - 1;
    if (x > -size) {
      canvas.style.left = x + 'px';
    } else {
      clearInterval(timer);
      canvas.remove();
    }
  }, freq);
}

function catsWalk(freq, catCanvas) {
  const timer = setInterval(function() {
    if (Math.random() > 0.995) {
      catWalk(getRandomInt(5, 20), catCanvas);
    }
  }, 10);
}

let gameTimer;
function startGameTimer() {
  clearInterval(gameTimer);
  const timeNode = document.getElementById('time');
  timeNode.innerText = '120秒 / 120秒';
  gameTimer = setInterval(function() {
    const arr = timeNode.innerText.split('秒 /');
    const t = parseInt(arr[0]);
    if (t > 0) {
      timeNode.innerText = (t-1) + '秒 /' + arr[1];
    } else {
      clearInterval(gameTimer);
      playAudio(endAudio);
      scoring();
    }
  }, 1000);
}

let countdownTimer;
function countdown() {
  solveCount = 0;
  clearTimeout(countdownTimer);
  gameStart.classList.remove('d-none');
  playPanel.classList.add('d-none');
  scorePanel.classList.add('d-none');
  const counter = document.getElementById('counter');
  counter.innerText = 3;
  countdownTimer = setInterval(function(){
    const colors = ['skyblue', 'greenyellow', 'violet', 'tomato'];
    if (parseInt(counter.innerText) > 1) {
      const t = parseInt(counter.innerText) - 1;
      counter.style.backgroundColor = colors[t];
      counter.innerText = t;
    } else {
      clearTimeout(countdownTimer);
      gameStart.classList.add('d-none');
      playPanel.classList.remove('d-none');
      solveCount = 0;
      document.getElementById('score').innerText = 0;
      nextProblem();
      startGameTimer();
    }
  }, 1000);
}

function scoring() {
  playPanel.classList.add('d-none');
  scorePanel.classList.remove('d-none');
  document.getElementById('score').textContent = solveCount;
}

function updateChart(chart, labelPos, pos) {
  if (labelPos == 0) {
    correctArray[pos] += 1;
    chart.data.datasets[labelPos].data = correctArray.slice();
  } else {
    incorrectArray[pos] += 1;
    chart.data.datasets[labelPos].data = incorrectArray.slice();
  }
  chart.update();
}

function initChart() {
  const data = {
    labels: Array.from(alphabet),
    datasets: [{
      label: 'OK',
      data: new Array(alphabet.length),
      borderColor: 'rgba(0,0,255,1)',
      backgroundColor: 'rgba(0,0,255,0.5)',
    },
    {
      label: 'NG',
      data: new Array(alphabet.length),
      borderColor: 'rgba(255,0,0,1)',
      backgroundColor: 'rgba(255,0,0,0.5)',
    }]
  };
  const config = {
    type: 'bar',
    data: data,
    options: {
      responsive: true,
      aspectRatio: 4,
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: false,
          text: '正答数 / 誤答数'
        }
      }
    },
  };
  return new Chart(document.getElementById('chart'), config);
}

function formatReply(reply) {
  reply = reply.toLowerCase();
  switch (reply) {
    case 'hey': return 'a';
    case 'be': return 'b';
    case 'sea': case 'see': return 'c';
    case 'jay': return 'j';
    case 'oh': return 'o';
    case 'ar': return 'r';
    case 'you': return 'u';
    case 'why': return 'y';
    case 'light': case 'fly': case 'lead': case 'play':
    case 'lice': case 'glass': case 'liver': case 'load': case 'long':
      return 'l';
    case 'right': case 'fry': case 'read': case 'play':
    case 'rice': case 'grass': case 'river': case 'road': case 'wrong':
      return 'r';
  }
  return reply;
}

function setVoiceInput() {
  if (!('webkitSpeechRecognition' in window)) {
    document.getElementById('nosupport').classList.remove('d-none');
  } else {
    let voiceInput = new webkitSpeechRecognition();
    voiceInput.lang = 'en-US';
    // voiceInput.interimResults = true;
    voiceInput.continuous = true;

    voiceInput.onstart = (event) => {
      const startButton = document.getElementById('start-voice-input');
      const stopButton = document.getElementById('stop-voice-input');
      startButton.classList.add('d-none');
      stopButton.classList.remove('d-none');
    };
    voiceInput.onend = (event) => {
      if (!speechSynthesis.speaking) {
        voiceInput.start();
      }
    };
    voiceInput.onresult = (event) => {
      const reply = event.results[0][0].transcript;
      document.getElementById('reply').textContent = reply;
      if (formatReply(reply) == answer.toLowerCase()) {
        playAudio(correctAudio);
        nextProblem();
      } else {
        updateChart(scoreChart, 1, alphabet.indexOf(answer));
      }
      voiceInput.stop();
    };
    return voiceInput;
  }
}

function startVoiceInput() {
  voiceInput.start();
}

function stopVoiceInput() {
  const startButton = document.getElementById('start-voice-input');
  const stopButton = document.getElementById('stop-voice-input');
  startButton.classList.remove('d-none');
  stopButton.classList.add('d-none');
  document.getElementById('reply').textContent = '英語で答えてください';
  voiceInput.stop();
}


[...document.getElementById('lr').getElementsByTagName('td')].forEach(tr => {
  tr.onclick = function() {
    speak(this.firstElementChild.textContent);
  };
});
document.addEventListener('click', unlockAudio, { once:true, useCapture:true });

