/*eslint no-unused-vars:0 */
import { app } from './lib/app'
app({
  port: 8181,
  lambdas: './build/lambdas/'
})
