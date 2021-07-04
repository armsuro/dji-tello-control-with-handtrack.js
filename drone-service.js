const { createSocket } = require('dgram');
const { spawn } = require('child_process');
const constants = require('./config/constants');

class DroneService {
  constructor() {
    const udpSocket = createSocket('udp4');
    udpSocket.bind(constants.udpPort);
    this.udpSocket = udpSocket;
  }

  send(command) {
    return new Promise((resolve) => {
      this.udpSocket.send(command, 0, command.length, constants.udpPort, constants.udpHost, (err) => {
        if (err) {
          throw err;
        } else {
          return resolve();
        }
      });
    });
  }

  streamonCommand() {
    // eslint-disable-next-line
    return new Promise(async (resolve) => {
      await this.send('streamon', 0, 'streamon'.length, constants.udpPort, constants.udpHost);
      spawn('ffmpeg', [
        '-hide_banner',
        '-i',
        `udp://${constants.udpHost}:${constants.udpStreamPort}`,
        '-f',
        'mpegts',
        '-codec:v',
        'mpeg1video',
        '-s',
        '640x480',
        '-b:v',
        '800k',
        '-bf',
        '0',
        '-r',
        '20',
        `${constants.streamEndpoint}`,
      ]);
      return resolve();
    });
  }
}

module.exports = new DroneService();
