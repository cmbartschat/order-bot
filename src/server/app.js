const express = require('express')
const bodyParser = require('body-parser')

const {SlackResponse} = require('./slack')
const Order = require('./order')

const app = express()

const capitalizeFirst = string => {
  return string[0].toUpperCase() + string.slice(1)
}

const helpText = [
  'Save an order:',
  '    /order gotts double cheeseburger',
  '',
  'Post a saved order:',
  '    /order gotts',
  '',
  'Check your saved orders:',
  '    /order list'
].join('\n')

const parseText = (text) => {
  const match = text.match(/(\S+)\s*(\S.*)?/)

  if (!match) {
    return null
  }

  return {
    first: match[1],
    rest: match[2],
  }
}

app.use(bodyParser.urlencoded())

app.use(express.static('dist'))

app.use('/api/slash', (req, res) => {

  // Notify Slack of receipt
  res.send()

  const params = Object.assign({}, req.query, req.body)

  const {text, response_url, user_id, user_name} = params

  const response = new SlackResponse(response_url)

  const parsed = parseText(text)

  if (!parsed) {
    return response.sendEphemeral(`No command provided. Type '/order help' for instructions.`)
  }

  const {first, rest} = parsed

  if (first === 'help') {
    return response.sendEphemeral(helpText)
  }

  let execute

  if (first === 'list') {
    execute = Order.list(user_id).then((orders) => {
      if (orders.length === 0) {
        response.sendEphemeral(`You don't have any saved orders.`)
      } else {
        const orderString = orders
          .map(({location, value}) => `    ${location}: ${value}`)
          .join('\n')

        response.sendEphemeral(`Your saved orders are:\n${orderString}`)
      }
    })
  } else if (rest === 'delete') {
    // Delete saved order
    const location = first
    execute = Order.delete(user_id, location).then(() => {
      response.sendEphemeral(`Cleared your ${location} order.`)
    })
  } else if (rest) {
    // Save order
    const location = first
    const order = rest

    execute = Order.set(user_id, location, order).then(() => {
      response.sendEphemeral(`Saved your ${location} order as: ${order}.`)
    })
  } else {
    // Post saved order
    const location = first
    execute = Order.get(user_id, location).then(order => {
      if (order) {
        response.sendToChannel(`${capitalizeFirst(user_name)}'s order is: ${order.value}`)
      } else {
        response.sendEphemeral(`You don't have a saved order for ${location}.`)
      }
    })
  }

  execute.catch(error => {
    response.sendEphemeral('An error occurred:\n    ' + error.message || error.toString())
  })
})

const listener = app.listen(process.env.PORT || 8000, function() {
  console.log('Listening on port ' + listener.address().port);
});
