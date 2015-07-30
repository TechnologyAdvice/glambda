exports.handler = function (event, context) {
  context.succeed({
    lambda: 'apples',
    event: event,
    home: process.env.HOME
  })
}