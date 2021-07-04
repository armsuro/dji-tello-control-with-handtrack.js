const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const DronHelper = require('./drone-service.js');
const constants = require('./config/constants');

let lastAction = null;
app.use(express.static('public'));

const run = async () => {
  await DronHelper.send('command');
  await DronHelper.send('battery?');
  await DronHelper.streamonCommand();

  setInterval(async ()=> {
    await DronHelper.send(`${constants.maping[lastAction]} 20`);
    io.emit('lastAction', lastAction);
  }, 1000);
};

app.post('/stream', (req, res) => {
  req.on('data', function(data) {
    io.emit('stream', data);
  });
});

io.on('connection', async (socket) => {
  socket.on('start', async () => {
    await run();
    await DronHelper.send('takeoff');
  });
  socket.on('stop', async () => {
    await DronHelper.send('land');
  });

  socket.on('action', async (msg) => {
    lastAction = msg;
  });
});


http.listen(constants.serverPort, () => {
  // eslint-disable-next-line
  console.log(`Server running at port ${constants.serverPort}`);
});
