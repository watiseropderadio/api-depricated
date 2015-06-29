var express = require('express');
var app = express();
var port = process.env.PORT || 5000;

var router = require('./router')(app);

// Error Handling
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
});

app.listen(port, function() {
  console.log('App is running at http://localhost:' + port);
});

module.exports = app;
