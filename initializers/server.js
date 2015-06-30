'use strict';

var bodyParser = require('body-parser');
var cors = require('cors');
var cookieParser = require('cookie-parser');
var morgan = require('morgan');
var responseTime = require('response-time');

var Server = function(express) {
  var server = express();

  server.use(bodyParser.text());
  server.use(bodyParser.json());
  server.use(cookieParser());
  server.use(morgan('combined'));
  server.use(responseTime());

  server.use(cors({
    methods: ['GET', 'POST', 'OPTIONS', 'DELETE', 'PATCH', 'UPDATE'],
    credentials: true,
    allowedHeaders: ['Authorization', 'Access-Control-Allow-Credentials', 'Accept', 'Content-Type'],
    origin: true
  }));

  return server;
};

module.exports = Server;
