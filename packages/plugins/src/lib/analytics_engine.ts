import * as dockerNames from 'docker-names'
import { WorkerdConfig, Service } from '@c0b41/workerd-config'

export interface AnalyticsEngineOptions {
  name: string
  dataset_id: string
}

export default (options: AnalyticsEngineOptions) => {
  return (instance: WorkerdConfig, service: Service) => {}
}
