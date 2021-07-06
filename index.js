const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const DronHelper = require('./drone-service.js');
const constants = require('./config/constants');
let timeout;

app.use(express.static('public'));


app.post('/stream', (req, res) => {
  req.on('data', function(data) {
    io.emit('stream', data);
  });
});

io.on('connection', async (socket) => {
  socket.on('start', async () => {
    await DronHelper.send('command');
    await DronHelper.streamonCommand();
    await DronHelper.send('takeoff');
  });
  socket.on('stop', async () => {
    await DronHelper.send('land');
  });


  socket.on('action', async (msg) => {
    if (!timeout) {
      timeout = setTimeout(async () => {
        await DronHelper.send(`${constants.maping[msg]} 20`);
        io.emit('lastAction', constants.maping[msg]);
        timeout = null;
      }, 500);
    }
  });
});


http.listen(constants.serverPort, () => {
  // eslint-disable-next-line
  console.log(`Server running at port ${constants.serverPort}`);
});
