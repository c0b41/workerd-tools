// https://www.npmjs.com/package/sqlite

import { createServer, request } from 'http'
import { PassThrough } from 'node:stream'

export const parseRequest = (data) =>
  new Promise((resolve) =>
    createServer()
      .on('request', resolve)
      .on('connection', (stream) => stream.write(data))
      .emit('connection', new PassThrough())
  )
export const parseResponse = (data) =>
  new Promise((resolve) =>
    // @ts-ignore
    request({ createConnection: () => new PassThrough() })
      .on('socket', (stream) => stream.write(data))
      .on('response', resolve)
  )

import { sqliteFunc } from '../../types/index'

export class DBHelper {
  private readonly db: sqliteFunc
  constructor(sql) {
    this.db = sql
  }

  public async find(query: string, params: Object): Promise<Object | null> {
    let result = await this.db.get(query, params)
    return result ? result : null
  }

  public async findAll(query: string, params: Object): Promise<[Object] | null> {
    let result = await this.db.all(query, params)
    return result ? result : null
  }

  public async run(query: string) {
    return await this.db.run(query)
  }

  public async exec(query: string) {
    return await this.db.exec(query)
  }
}
