import { FastifyInstance } from 'fastify'
import { Response } from 'undici'
import { IECacheGateway, StoredMeta } from '../../../../types/index'
import { DBHelper } from '../../utils'

// https://github.com/cloudflare/miniflare/blob/tre/packages/tre/src/storage/sqlite.ts#L70
class CacheGateway implements IECacheGateway {
  private instance: FastifyInstance
  private db: DBHelper
  constructor(app: FastifyInstance) {
    this.instance = app
    this.db = new DBHelper(app.sqlite)
  }

  private async parse(result) {
    if (!result) return null

    const onParse = (result) => {
      //let parsed = {} as StoredMeta
      //if (result.attributes) {
      //  const json = JSON.parse(result.attributes)
      //  parsed.expiration = json.expiration
      //  parsed.metadata = json.metadata as Meta
      //}
      //return parsed
    }

    if (Array.isArray(result)) {
      return result.map((item: any) => onParse(item))
    }

    let parsed = onParse(result)

    return parsed
  }

  public async getCache(cacheID, namespace, key) {
    let result = await this.db.find(
      `SELECT attributes FROM caches WHERE key = :key AND cache_id = :cache_id`,
      {
        ':key': key,
        ':cache_id': cacheID,
      }
    )

    let parsed = this.parse(result)

    return new Response('')
  }
  public async putCache() {
    return new Response('')
  }
  public async deleteCache() {
    return new Response('')
  }
  public async onReady() {
    // create db tables..
    //await this.db.run(`
    //  CREATE TABLE IF NOT EXISTS cache_list (
    //    id TEXT NOT NULL,
    //    name TEXT NOT NULL,
    //    PRIMARY KEY (id)
    //  )
    //`)
    //await this.db.run(`
    //  CREATE TABLE IF NOT EXISTS caches (
    //    cache_id TEXT NOT NULL,
    //    key TEXT NOT NULL,
    //    value BLOB,
    //    attributes TEXT,
    //    PRIMARY KEY (key) FOREIGN KEY (cache_id) REFERENCES cache_list(id)
    //  )
    //`)
  }
  public async onClose() {}
}

export default CacheGateway
