import { Client } from 'pg'

export default (env) => {
  return new Client(env.config)
}
