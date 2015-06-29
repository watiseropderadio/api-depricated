module.exports = function(app) {
  app.use('/signup', require('./routes/signup'));
};
