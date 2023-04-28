import * as dockerNames from 'docker-names'
import { WorkerdConfig, Service } from '@c0b41/workerd-config'

type PostgresConnectionOptions = {
  host: string
  port: string
  username: string
  password: string
  ssl?: boolean
}

export interface PostgresSqlOptions {
  name: string
  auth: string | PostgresConnectionOptions
}

export default (options: PostgresSqlOptions) => {
  return (instance: WorkerdConfig, service: Service) => {}
}
