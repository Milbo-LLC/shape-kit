import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'

import { projects } from './schema.js'

const sqlite = new Database('shape-kit.db')

export const db = drizzle(sqlite)

export const schema = {
  projects
}
