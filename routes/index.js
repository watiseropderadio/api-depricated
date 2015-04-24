'use strict';

exports.list = function(req, res) {
  res.send(JSON.stringify({
    author: 'Adriaan van Rossum',
    email: 'api@watiseropderadio.nl',
    website: 'http://watiseropderadio.nl',
    version: '0.0.1'
  }));
};
