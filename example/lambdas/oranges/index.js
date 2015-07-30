exports.handler = function (event, context) {
  context.succeed({
    lambda: 'oranges',
    event: event
  })
}