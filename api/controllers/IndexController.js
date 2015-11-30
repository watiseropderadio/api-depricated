/**
 * IndexController
 *
 * @description :: Server-side logic for managing indices
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

  get: function(req, res) {
    return res.json({
      name: 'API',
      description: 'API for serving the data for http://watiseropderadio.nl',
      author: 'Adriaan van Rossum',
      contact: 'api@watiseropderadio.nl',
      repository: 'https://github.com/watiseropderadio/api',
      version: '1.0.2'
    });
  }

};
