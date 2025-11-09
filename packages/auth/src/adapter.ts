import { and, eq } from 'drizzle-orm'
import type { AnyPgTable } from 'drizzle-orm/pg-core'

import { db, schema } from '@shape-kit/db'

type Schema = typeof schema

type TableName = {
  [Key in keyof Schema]: Schema[Key] extends AnyPgTable ? Key : never
}[keyof Schema]

const entityToTable: Record<string, TableName> = {
  user: 'users',
  users: 'users',
  session: 'sessions',
  sessions: 'sessions',
  organization: 'organizations',
  organizations: 'organizations',
  organizationMembership: 'organizationMemberships',
  organizationMemberships: 'organizationMemberships',
  workspace: 'workspaces',
  workspaces: 'workspaces',
  workspaceMembership: 'workspaceMemberships',
  workspaceMemberships: 'workspaceMemberships'
}

const resolveTable = (entity: string): AnyPgTable => {
  const tableName = entityToTable[entity]
  if (!tableName) {
    throw new Error(`Unknown entity "${entity}" for Better Auth adapter`)
  }
  return schema[tableName] as AnyPgTable
}

const buildWhere = (table: any, filter: Record<string, unknown> = {}) => {
  const conditions = Object.entries(filter).map(([key, value]) => eq(table[key], value as any))
  if (!conditions.length) return undefined
  return conditions.length === 1 ? conditions[0] : and(...conditions)
}

export const drizzleAdapter = {
  id: 'drizzle-postgres',
  async create(entity: string, data: Record<string, unknown>) {
    const table = resolveTable(entity)
    const [record] = await db.insert(table).values(data).returning().execute()
    return record
  },
  async findOne(entity: string, filter: Record<string, unknown>) {
    const table = resolveTable(entity)
    const where = buildWhere(table, filter)
    const query = db.select().from(table).limit(1)
    if (where) {
      query.where(where)
    }
    const [record] = await query.execute()
    return record ?? null
  },
  async findMany(entity: string, filter: Record<string, unknown>) {
    const table = resolveTable(entity)
    const where = buildWhere(table, filter)
    const query = db.select().from(table)
    if (where) {
      query.where(where)
    }
    return query.execute()
  },
  async update(entity: string, filter: Record<string, unknown>, data: Record<string, unknown>) {
    const table = resolveTable(entity)
    const where = buildWhere(table, filter)
    const query = db.update(table).set(data)
    if (where) {
      query.where(where)
    }
    const [record] = await query.returning().execute()
    return record ?? null
  },
  async delete(entity: string, filter: Record<string, unknown>) {
    const table = resolveTable(entity)
    const where = buildWhere(table, filter)
    const query = db.delete(table)
    if (where) {
      query.where(where)
    }
    const [record] = await query.returning().execute()
    return record ?? null
  },
  async deleteMany(entity: string, filter: Record<string, unknown>) {
    const table = resolveTable(entity)
    const where = buildWhere(table, filter)
    const query = db.delete(table)
    if (where) {
      query.where(where)
    }
    const deleted = await query.returning().execute()
    return deleted
  }
}

export type DrizzleAdapter = typeof drizzleAdapter
