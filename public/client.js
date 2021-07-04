const BACKEND_URL = 'http://127.0.0.1:3001';
let video; let canvas; let context; let lastAction; let socket; let player; let model;

const socketEvent = (predictions) => {
  for (const i in predictions) {
    if (predictions[i].label !== 'face' && predictions[i].score >= 0.8) {
      lastAction = predictions[i].label;
      socket.emit('action', lastAction);
    }
  }
};

const startVideo = () => {
  handTrack.startVideo(video).then((status) => {
    if (status) {
      runDetection();
    } else {
      alert('Please enable video');
    }
  });
};

const runDetection = () => {
  model.detect(video).then((predictions) => {
    socketEvent(predictions);
    model.renderPredictions(predictions, canvas, context, video);
    requestAnimationFrame(runDetection);
  });
};

const startDrone = () => {
  startVideo();
  socket.emit('start', true);
};

const stopDrone = () => {
  socket.emit('stop', true);
  handTrack.stopVideo(video);
};

socket = io(BACKEND_URL, {
  allowUpgrades: false,
  upgrade: true,
  transports: ['websocket'],
});

socket.on('connect', async () => {
  video = document.getElementById('localVideo');
  canvas = document.getElementById('canvas');
  context = canvas.getContext('2d');
  model = await handTrack.load({
    flipHorizontal: true,
    maxNumBoxes: 5,
    iouThreshold: 0.5,
    scoreThreshold: 0.6,
  });

  player = new JSMpeg.Player('pipe', {
    canvas: document.getElementById('canvasVideo'),
  });
  console.log('Connect');
});

socket.on('lastAction', (msg) => {
    document.getElementById("lastAction").innerHTML = msg;
})
socket.on('stream', (data) =>{
  player.write(data);
});
