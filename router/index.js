module.exports = function(server, database) {
  server.use('/signup', require('./routes/signup')(server, database));
};
