// https://www.npmjs.com/package/sqlite

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
