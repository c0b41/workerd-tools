import { FastifyInstance } from 'fastify'
import { IEKvGateway } from '../../../../types/index'

class KvGateway implements IEKvGateway {
  private readonly instance: FastifyInstance
  constructor(instance: FastifyInstance) {
    this.instance = instance
  }
  listKv(): void {}
  getKv(): void {}
  putKv(): void {}
  deleteKv(): void {}
  async onReady() {}
}

export { KvGateway }
