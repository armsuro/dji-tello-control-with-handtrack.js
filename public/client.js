/* eslint-disable */
const BACKEND_URL = 'http://127.0.0.1:3001';
const video = document.createElement('video');
const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');
const canvasVideo = document.getElementById('canvasVideo');
const startButton = document.getElementById('startBtn');
const stopButton = document.getElementById('stopBtn');
const actionLog = document.getElementById('lastAction');

let lastAction, socket, player, model;

const socketEvent = (predictions) => {
  for (const i in predictions) {
    if (predictions[i].label !== 'face' && predictions[i].score >= 0.8) {
      lastAction = predictions[i].label;
      socket.emit('action', lastAction);
    }
  }
};

const startVideo = async () => {
  const status = await handTrack.startVideo(video);
  if(status) runDetection()
  else alert('Please enable video');
};

const runDetection = async () => {
  const predictions = await model.detect(video);
  socketEvent(predictions);
  model.renderPredictions(predictions, canvas, context, video);
  requestAnimationFrame(runDetection);
};

const startDrone = () => {
  startVideo();
  socket.emit('start', true);
};

const stopDrone = () => {
  socket.emit('stop', true);
  handTrack.stopVideo(video);
};

const onSocketConnect = async () => {
  model = await handTrack.load({
    flipHorizontal: true,
    maxNumBoxes: 5,
    iouThreshold: 0.5,
    scoreThreshold: 0.6,
  });

  startButton.disabled = false;

  player = new JSMpeg.Player('pipe', {
    canvas: canvasVideo,
  });
  console.log('Connect');
}

const onLastAction = (msg) => {
  actionLog.innerHTML = msg;
}

const onStreamMessage = (data) => {
  player.write(data);
}

socket = io(BACKEND_URL, {
  allowUpgrades: false,
  upgrade: true,
  transports: ['websocket'],
});

socket.on('connect', onSocketConnect);
socket.on('lastAction', onLastAction)
socket.on('stream', onStreamMessage);

startButton.onclick = startDrone;
stopButton.onclick = stopDrone;