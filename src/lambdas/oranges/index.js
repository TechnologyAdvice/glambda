export const handler = (event, context) => {
  context.succeed(`Oranges ${JSON.stringify(event)}`)
}
