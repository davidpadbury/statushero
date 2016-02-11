var invariant = require('invariant')
var request = require('request').defaults({ jar: true })
var jsdom = require('jsdom')
var async = require('async')

var URL = 'https://statushero.com'

module.exports = function (options) {
  return function (update, callback) {
    invariant(update, '`update` required')
    invariant(update.yesterday, '`update.yesterday` required')
    invariant(update.today, '`update.today` required')

    async.waterfall([
      getSignIn,
      signIn,
      getStatus,
      updateStatus
    ], callback)

    function getSignIn (callback) {
      request(URL + '/sign_in', function (err, res, body) {
        if (err) return calllback(err)

        runInDom(body, window => window.document.querySelector('input[name=authenticity_token]').value, function (err, input) {
          if (err) return callback(err)

          callback(err, {
            token: input
          })
        })
      })
    }

    function signIn (params, callback) {
      var requestOptions = {
        url: URL + '/users/sign_in',
        form: {
          authenticity_token: params.token,
          'user[email]': options.username,
          'user[password]': options.password
        }
      }

      request.post(requestOptions, function (err, res, body) {
        if (err) return callback(err)

        switch (res.statusCode) {
          case 302:
            callback(null)
            break

          default:
            callback(new Error('Login failed'))
            break
        }
      })
    }

    function getStatus (callback) {
      request(URL + '/statuses/current/edit', function (err, res, body) {
        if (err) return callback(err)

        function selectParams (document) {
          var form = document.querySelector('form.new_answer_set')

          return {
            action: form.action,
            token: form.querySelector('input[name=authenticity_token]').value
          }
        }

        runInDom(body, window => selectParams(window.document), callback)
      })
    }

    function updateStatus (params, callback) {
      var requestOptions = {
        url: URL + params.action,
        form: {
          _method: 'put',
          authenticity_token: params.token,
          'answer_set[previous]': update.yesterday,
          'answer_set[next]': update.today,
          'answer_set[blockers]': update.blockers,
          'answer_set[previous_completed]': '1'
        }
      }

      request.post(requestOptions, (err, res) => {
        if (err) return callback(err)

        switch (res.statusCode) {
          case 302:
            callback(null)
            break

          default:
            callback(new Error('Failed to update status'))
            break
        }
      })
    }
  }
}

function runInDom (html, selector, callback) {
  jsdom.env(html, function (err, window) {
    if (err) return callback(err)

    try {
      var result = selector(window)
      callback(null, result)
    } catch (err) {
      callback(err)
    }
  })
}
