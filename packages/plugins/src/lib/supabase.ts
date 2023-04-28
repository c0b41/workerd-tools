import * as dockerNames from 'docker-names'
import { WorkerdConfig, Service } from '@c0b41/workerd-config'
import { External } from '@c0b41/workerd-config'

export interface SupabaseOptions {}

export default (options: SupabaseOptions) => {
  return (instance: WorkerdConfig, service: Service) => {
    //console.log(instance)
    //console.log(service.name)
  }
}
