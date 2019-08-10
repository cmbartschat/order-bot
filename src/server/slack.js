const request = require('request')

function SlackResponse(responseUrl) {

  const sendResponse = response => {
    if (!responseUrl) {
      console.log('Response:\n', response)
      return
    }

    request.post({
      url: responseUrl,
      json: true,
      body: response
    })
  }

  this.sendToChannel = text => sendResponse({
    response_type: 'in_channel',
    text: text,
  })

  this.sendEphemeral = text => sendResponse({
    text: '',
    attachments: [{text}],
  })
}

module.exports = {
  SlackResponse,
}