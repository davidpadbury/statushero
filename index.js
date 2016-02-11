var invariant = require('invariant')
var updateStatus = require('./lib/updateStatus')

module.exports = function statushero (options) {
  invariant(options, '`options` required')
  invariant(options.username, '`options.username` required')
  invariant(options.password, '`options.password` required')

  return {
    updateStatus: updateStatus(options)
  }
}
