/**
 * 400 (Bad Request) Handler
 *
 * Usage:
 * return res.badRequest();
 * return res.badRequest(data);
 * return res.badRequest(data, 'some/specific/badRequest/view');
 *
 * e.g.:
 * ```
 * return res.badRequest(
 *   'Please choose a valid `password` (6-12 characters)',
 *   'trial/signup'
 * );
 * ```
 */

module.exports = function badRequest(data, options) {

  // Get access to `req`, `res`, & `sails`
  var req = this.req
  var res = this.res
  var sails = req._sails

  // Set status code
  res.status(400)

  // Log error to console
  if (data !== undefined) {
    sails.log.verbose('Sending 400 ("Bad Request") response: \n', data)
  } else sails.log.verbose('Sending 400 ("Bad Request") response')

  var response = null
  var responses = []

  var error = {
    status: '400',
    title: 'Bad request, you can probably fix this yourself'
  }

  if (data && data.code === 'E_VALIDATION' && data.invalidAttributes) {
    _.each(data.invalidAttributes, function(value, model) {
      _.each(value, function(object) {
        if (_.isString(object.message)) {
          responses.push({
            status: '400',
            title: 'Wrong input on field ' + model,
            detail: object.message.split('"').join("'").split('`').join("'")
          })
        }
      })
    })
    response = responses
  } else if (_.isArray(data)) {
    _.each(data, function(element) {
      responses.push({
        status: '400',
        title: 'Bad request',
        detail: element
      })
    })
    response = responses
  } else if (!_.isUndefined(data)) {
    error.detail = data
    response = [error]
  } else {
    response = [error]
  }

  return res.jsonx({
    errors: response
  })

}
