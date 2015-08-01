exports.handler = function (event, context) {
  if (event.failTest) {
    context.fail('Fail test')
  } else {
    context.succeed(event)
  }
}