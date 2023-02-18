import { FastifyInstance } from 'fastify'
import { IECacheGateway, StoredMeta } from '../../../../types/index'

// https://github.com/cloudflare/miniflare/blob/tre/packages/tre/src/storage/sqlite.ts#L70
class CacheGateway implements IECacheGateway {
  private instance: FastifyInstance
  constructor(app: FastifyInstance) {
    this.instance = app
  }

  public async one(query: string) {
    let result = await this.instance.sqlite.get(query)

    if (!result) return null

    let parsed = {} as StoredMeta

    if (result.attributes) {
      const json = JSON.parse(result.attributes)
      parsed.expiration = json.expiration
      parsed.metadata = json.metadata as Meta
    }
  }

  async match() {
    try {
      let key = 'test'
      let result = await this.one(`SELECT attributes FROM caches WHERE key='${key}'`)
      return result
    } catch (error) {
      console.log(error)
      return null
    }
  }
  async put() {}
  async delete() {}
  onStart() {}
  getCache(): void {}
  putCache(): void {}
  deleteCache(): void {}
}

export default CacheGateway
