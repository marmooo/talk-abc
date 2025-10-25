import {
  BarController,
  BarElement,
  CategoryScale,
  Chart,
  LinearScale,
} from "https://cdn.jsdelivr.net/npm/chart.js@4.5.0/+esm";
import { createWorker } from "https://cdn.jsdelivr.net/npm/emoji-particle@0.0.4/+esm";

Chart.register(BarController, BarElement, CategoryScale, LinearScale);

const playPanel = document.getElementById("playPanel");
const infoPanel = document.getElementById("infoPanel");
const countPanel = document.getElementById("countPanel");
const scorePanel = document.getElementById("scorePanel");
const replyPlease = document.getElementById("replyPlease");
const reply = document.getElementById("reply");
const gameTime = 180;
const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const emojiParticle = initEmojiParticle();
const maxParticleCount = 10;
let problemCandidate = Array.from(alphabet);
let answer = "Talk ABC";
let firstRun = true;
let catCounter = 0;
let correctCount = 0;
const correctArray = new Array(26).fill(0);
const incorrectArray = new Array(26).fill(0);
const scoreChart = initChart();
let englishVoices = [];
let audioContext;
let voiceStopped = false;
const audioBufferCache = {};
loadVoices();
const voiceInput = setVoiceInput();
loadConfig();

function loadConfig() {
  if (localStorage.getItem("darkMode") == 1) {
    document.documentElement.setAttribute("data-bs-theme", "dark");
  }
  if (localStorage.getItem("furigana") == 1) {
    const obj = document.getElementById("addFurigana");
    addFurigana(obj);
    obj.setAttribute("data-done", true);
  }
}

function toggleDarkMode() {
  if (localStorage.getItem("darkMode") == 1) {
    localStorage.setItem("darkMode", 0);
    document.documentElement.setAttribute("data-bs-theme", "light");
  } else {
    localStorage.setItem("darkMode", 1);
    document.documentElement.setAttribute("data-bs-theme", "dark");
  }
}

function addFurigana() {
  const obj = document.getElementById("addFurigana");
  if (obj.getAttribute("data-done")) {
    localStorage.setItem("furigana", 0);
    location.reload();
  } else {
    import("https://marmooo.github.io/yomico/yomico.min.js").then((module) => {
      module.yomico("index.yomi");
    });
    localStorage.setItem("furigana", 1);
    obj.setAttribute("data-done", true);
  }
}

function createAudioContext() {
  if (globalThis.AudioContext) {
    return new globalThis.AudioContext();
  } else {
    console.error("Web Audio API is not supported in this browser");
    return null;
  }
}

function unlockAudio() {
  if (audioContext) {
    audioContext.resume();
  } else {
    audioContext = createAudioContext();
    loadAudio("end", "mp3/end.mp3");
    loadAudio("error", "mp3/cat.mp3");
    loadAudio("correct", "mp3/correct3.mp3");
  }
  document.removeEventListener("click", unlockAudio);
  document.removeEventListener("keydown", unlockAudio);
}

async function loadAudio(name, url) {
  if (!audioContext) return;
  if (audioBufferCache[name]) return audioBufferCache[name];
  try {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    audioBufferCache[name] = audioBuffer;
    return audioBuffer;
  } catch (error) {
    console.error(`Loading audio ${name} error:`, error);
    throw error;
  }
}

function playAudio(name, volume) {
  if (!audioContext) return;
  const audioBuffer = audioBufferCache[name];
  if (!audioBuffer) {
    console.error(`Audio ${name} is not found in cache`);
    return;
  }
  const sourceNode = audioContext.createBufferSource();
  sourceNode.buffer = audioBuffer;
  const gainNode = audioContext.createGain();
  if (volume) gainNode.gain.value = volume;
  gainNode.connect(audioContext.destination);
  sourceNode.connect(gainNode);
  sourceNode.start();
}

function loadVoices() {
  // https://stackoverflow.com/questions/21513706/
  const allVoicesObtained = new Promise((resolve) => {
    let voices = speechSynthesis.getVoices();
    if (voices.length !== 0) {
      resolve(voices);
    } else {
      let supported = false;
      speechSynthesis.addEventListener("voiceschanged", () => {
        supported = true;
        voices = speechSynthesis.getVoices();
        resolve(voices);
      });
      setTimeout(() => {
        if (!supported) {
          document.getElementById("noTTS").classList.remove("d-none");
        }
      }, 1000);
    }
  });
  const jokeVoices = [
    // "com.apple.eloquence.en-US.Flo",
    "com.apple.speech.synthesis.voice.Bahh",
    "com.apple.speech.synthesis.voice.Albert",
    // "com.apple.speech.synthesis.voice.Fred",
    "com.apple.speech.synthesis.voice.Hysterical",
    "com.apple.speech.synthesis.voice.Organ",
    "com.apple.speech.synthesis.voice.Cellos",
    "com.apple.speech.synthesis.voice.Zarvox",
    // "com.apple.eloquence.en-US.Rocko",
    // "com.apple.eloquence.en-US.Shelley",
    // "com.apple.speech.synthesis.voice.Princess",
    // "com.apple.eloquence.en-US.Grandma",
    // "com.apple.eloquence.en-US.Eddy",
    "com.apple.speech.synthesis.voice.Bells",
    // "com.apple.eloquence.en-US.Grandpa",
    "com.apple.speech.synthesis.voice.Trinoids",
    // "com.apple.speech.synthesis.voice.Kathy",
    // "com.apple.eloquence.en-US.Reed",
    "com.apple.speech.synthesis.voice.Boing",
    "com.apple.speech.synthesis.voice.Whisper",
    "com.apple.speech.synthesis.voice.Deranged",
    "com.apple.speech.synthesis.voice.GoodNews",
    "com.apple.speech.synthesis.voice.BadNews",
    "com.apple.speech.synthesis.voice.Bubbles",
    // "com.apple.voice.compact.en-US.Samantha",
    // "com.apple.eloquence.en-US.Sandy",
    // "com.apple.speech.synthesis.voice.Junior",
    // "com.apple.speech.synthesis.voice.Ralph",
  ];
  allVoicesObtained.then((voices) => {
    englishVoices = voices
      .filter((voice) => voice.lang == "en-US")
      .filter((voice) => !jokeVoices.includes(voice.voiceURI));
  });
}

function speak(text) {
  speechSynthesis.cancel();
  const msg = new globalThis.SpeechSynthesisUtterance(text);
  msg.voice = englishVoices[Math.floor(Math.random() * englishVoices.length)];
  msg.lang = "en-US";
  speechSynthesis.speak(msg);
}

function respeak() {
  speak(answer.toLowerCase());
}

function initEmojiParticle() {
  const canvas = document.createElement("canvas");
  Object.assign(canvas.style, {
    position: "fixed",
    pointerEvents: "none",
    top: "0px",
    left: "0px",
  });
  canvas.width = document.documentElement.clientWidth;
  canvas.height = document.documentElement.clientHeight;
  document.body.prepend(canvas);

  const offscreen = canvas.transferControlToOffscreen();
  const worker = createWorker();
  worker.postMessage({ type: "init", canvas: offscreen }, [offscreen]);

  globalThis.addEventListener("resize", () => {
    const width = document.documentElement.clientWidth;
    const height = document.documentElement.clientHeight;
    worker.postMessage({ type: "resize", width, height });
  });
  return { canvas, offscreen, worker };
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min);
}

function hideAnswer() {
  reply.textContent = "";
}

function nextProblem() {
  for (let i = 0; i < Math.min(correctCount, maxParticleCount); i++) {
    emojiParticle.worker.postMessage({
      type: "spawn",
      options: {
        particleType: "popcorn",
        originX: Math.random() * emojiParticle.canvas.width,
        originY: Math.random() * emojiParticle.canvas.height,
      },
    });
  }
  hideAnswer();
  if (firstRun) {
    firstRun = false;
  } else {
    updateChart(scoreChart, 0, alphabet.indexOf(answer));
    correctCount += 1;
  }
  answer =
    problemCandidate.splice(getRandomInt(0, problemCandidate.length), 1)[0];
  if (problemCandidate.length <= 0) {
    problemCandidate = Array.from(alphabet);
  }
  document.getElementById("answer").textContent = answer;
  speak(answer.toLowerCase());
  startVoiceInput();
}

function catNyan() {
  playAudio("error");
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new globalThis.Image();
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = src;
  });
}

function loadCatImage(url) {
  const imgSize = 128;
  return new Promise((resolve) => {
    loadImage(url).then((originalImg) => {
      const canvas = document.createElement("canvas");
      canvas.setAttribute("role", "button");
      canvas.width = imgSize;
      canvas.height = imgSize;
      canvas.style.position = "absolute";
      // drawImage() faster than putImageData()
      canvas.getContext("2d").drawImage(originalImg, 0, 0);
      resolve(canvas);
    }).catch((e) => {
      console.log(e);
    });
  });
}
loadCatImage("kohacu.webp").then((catCanvas) => {
  catsWalk(catCanvas);
});

function catWalk(freq, catCanvas) {
  const area = document.getElementById("catsWalk");
  const width = area.offsetWidth;
  const height = area.offsetHeight;
  const canvas = catCanvas.cloneNode(true);
  canvas.getContext("2d").drawImage(catCanvas, 0, 0);
  const size = 128;
  canvas.style.top = getRandomInt(0, height - size) + "px";
  canvas.style.left = width - size + "px";
  canvas.addEventListener("click", () => {
    speak(alphabet[catCounter].toLowerCase());
    if (catCounter >= alphabet.length - 1) {
      catCounter = 0;
    } else {
      catCounter += 1;
    }
    canvas.remove();
  }, { once: true });
  area.appendChild(canvas);
  const timer = setInterval(() => {
    const x = parseInt(canvas.style.left) - 1;
    if (x > -size) {
      canvas.style.left = x + "px";
    } else {
      clearInterval(timer);
      canvas.remove();
    }
  }, freq);
}

function catsWalk(catCanvas) {
  setInterval(() => {
    if (Math.random() > 0.995) {
      catWalk(getRandomInt(5, 20), catCanvas);
    }
  }, 10);
}

let gameTimer;
function startGameTimer() {
  clearInterval(gameTimer);
  const timeNode = document.getElementById("time");
  initTime();
  gameTimer = setInterval(() => {
    const t = parseInt(timeNode.textContent);
    if (t > 0) {
      timeNode.textContent = t - 1;
    } else {
      clearInterval(gameTimer);
      playAudio("end");
      scoring();
      stopVoiceInput();
    }
  }, 1000);
}

function countdown() {
  speak("Ready"); // unlock
  countPanel.classList.remove("d-none");
  infoPanel.classList.add("d-none");
  playPanel.classList.add("d-none");
  scorePanel.classList.add("d-none");
  const counter = document.getElementById("counter");
  counter.textContent = 3;
  const timer = setInterval(() => {
    const colors = ["skyblue", "greenyellow", "violet", "tomato"];
    if (parseInt(counter.textContent) > 1) {
      const t = parseInt(counter.textContent) - 1;
      counter.style.backgroundColor = colors[t];
      counter.textContent = t;
    } else {
      clearInterval(timer);
      countPanel.classList.add("d-none");
      infoPanel.classList.remove("d-none");
      playPanel.classList.remove("d-none");
      correctCount = 0;
      document.getElementById("score").textContent = 0;
      nextProblem();
      startGameTimer();
    }
  }, 1000);
}

function initTime() {
  document.getElementById("time").textContent = gameTime;
}

function scoring() {
  playPanel.classList.add("d-none");
  scorePanel.classList.remove("d-none");
  document.getElementById("score").textContent = correctCount;
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
      label: "OK",
      data: new Array(alphabet.length),
      borderColor: "rgba(0,0,255,1)",
      backgroundColor: "rgba(0,0,255,0.5)",
    }, {
      label: "NG",
      data: new Array(alphabet.length),
      borderColor: "rgba(255,0,0,1)",
      backgroundColor: "rgba(255,0,0,0.5)",
    }],
  };
  const config = {
    type: "bar",
    data: data,
    options: {
      responsive: true,
      aspectRatio: 4,
      plugins: {
        legend: {
          position: "top",
        },
        title: {
          display: false,
          text: "正答数 / 誤答数",
        },
      },
    },
  };
  return new Chart(document.getElementById("chart"), config);
}

function formatReply(replyText) {
  replyText = replyText.toLowerCase();
  switch (replyText) {
    case "hey":
      return "a";
    case "be":
      return "b";
    case "sea":
    case "see":
      return "c";
    case "jay":
      return "j";
    case "oh":
      return "o";
    case "you":
      return "u";
    case "why":
      return "y";
    case "all":
    case "al":
    case "ale":
      return "l";
    case "are":
      return "r";
    default:
      return replyText[0].toLowerCase();
  }
}

function setVoiceInput() {
  if (!globalThis.webkitSpeechRecognition) {
    document.getElementById("noSTT").classList.remove("d-none");
  } else {
    const voiceInput = new globalThis.webkitSpeechRecognition();
    voiceInput.lang = "en-US";
    // voiceInput.interimResults = true;
    voiceInput.continuous = true;

    voiceInput.onend = () => {
      if (voiceStopped) return;
      voiceInput.start();
    };
    voiceInput.onresult = (event) => {
      voiceInput.stop();
      const replyText = event.results[0][0].transcript;
      reply.textContent = replyText;
      if (formatReply(replyText) == answer.toLowerCase()) {
        playAudio("correct", 0.3);
        nextProblem();
        replyPlease.classList.remove("d-none");
        reply.classList.add("d-none");
      } else {
        updateChart(scoreChart, 1, alphabet.indexOf(answer));
        replyPlease.classList.add("d-none");
        reply.classList.remove("d-none");
      }
    };
    return voiceInput;
  }
}

function startVoiceInput() {
  voiceStopped = false;
  document.getElementById("startVoiceInput").classList.add("d-none");
  document.getElementById("stopVoiceInput").classList.remove("d-none");
  replyPlease.classList.remove("d-none");
  reply.classList.add("d-none");
  try {
    voiceInput.start();
  } catch {
    // continue regardless of error
  }
}

function stopVoiceInput() {
  voiceStopped = true;
  document.getElementById("startVoiceInput").classList.remove("d-none");
  document.getElementById("stopVoiceInput").classList.add("d-none");
  replyPlease.classList.remove("d-none");
  reply.classList.add("d-none");
  voiceInput.abort();
}

document.getElementById("toggleDarkMode").onclick = toggleDarkMode;
document.getElementById("addFurigana").onclick = addFurigana;
document.getElementById("restartButton").onclick = countdown;
document.getElementById("startButton").onclick = countdown;
document.getElementById("respeak").onclick = respeak;
document.getElementById("startVoiceInput").onclick = startVoiceInput;
document.getElementById("stopVoiceInput").onclick = stopVoiceInput;
document.getElementById("kohacu").onclick = catNyan;
[...document.getElementById("lr").getElementsByTagName("button")]
  .forEach((button) => {
    button.onclick = () => {
      speak(button.firstElementChild.textContent);
    };
  });
document.addEventListener("click", unlockAudio, { once: true });
document.addEventListener("keydown", unlockAudio, { once: true });
