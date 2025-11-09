import type { NodePgDatabase } from 'drizzle-orm/node-postgres'
import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'

import * as schema from './schema.js'
export * from './security.js'

let dbInstance: NodePgDatabase<typeof schema> | null = null

export const getDatabase = () => {
  if (dbInstance) return dbInstance
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable must be set to connect to Postgres.')
  }
  const pool = new Pool({ connectionString })
  dbInstance = drizzle(pool, { schema })
  return dbInstance
}

export const db = new Proxy({} as NodePgDatabase<typeof schema>, {
  get(_target, property) {
    const instance = getDatabase() as any
    return Reflect.get(instance, property)
  }
})

export { schema }

export type DatabaseClient = ReturnType<typeof getDatabase>
