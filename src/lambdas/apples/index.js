export const handler = (event, context) => {
  context.succeed(`Apples ${JSON.stringify(event)}`)
}