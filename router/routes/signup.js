module.exports = function(server, database) {
  var router = server.Router();

  // POST /signup
  router.post('/', function(req, res) {
    // handle a post request to this route
  });

  // GET /signup/info
  router.get('/info', function(req, res) {
    // handle a get request to this route

    res.json({
      'errors': [{
        "message": "not implemented yet"
      }]
    });

  });

};
