module.exports = {
  'serverPort': process.env.PORT || 3001,
  'udpHost': '192.168.10.1',
  'udpPort': 8889,
  'udpStreamPort': 11111,
  'streamEndpoint': 'http://localhost:3001/stream',
  'maping': {
    'closed': 'down',
    'open': 'up',
    'point': 'cw',
  },
};
