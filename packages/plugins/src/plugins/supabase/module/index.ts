import { createClient } from '@supabase/supabase-js'

export default (env) => {
  const options = Object.assign(
    {},
    {
      global: {
        fetch: env.internet ? env.internet : fetch,
      },
    },
    env.options
  )
  // TODO:try catch block for createClient
  const supabase = createClient(env.supabaseUrl, env.supabaseKey, options)

  return supabase
}
