import { WorkerdConfig } from '@c0b41/workerd-config'

let config = new WorkerdConfig()

config.Service({
  name: 'test',
  next: 'sss',
})
