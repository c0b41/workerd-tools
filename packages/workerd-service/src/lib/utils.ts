// https://www.npmjs.com/package/sqlite

import { FastifyInstance } from 'fastify'
import { IEKvGateway, sqliteFunc, StoredMeta } from '../../types/index'

class KvGateway implements IEKvGateway {
  private readonly instance: FastifyInstance
  constructor(instance: FastifyInstance) {
    this.instance = instance
  }

  onStart(): void {}
  listKv(): void {}
  getKv(): void {}
  putKv(): void {}
  deleteKv(): void {}
}

export { KvGateway }
