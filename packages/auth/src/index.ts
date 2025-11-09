import { betterAuth, type Adapter, type BetterAuthOptions } from 'better-auth'

const unconfiguredAdapter: Adapter = {
  id: 'unconfigured',
  async create() {
    throw new Error('Auth adapter is not configured. Please provide a database adapter before using auth APIs.')
  },
  async findOne() {
    throw new Error('Auth adapter is not configured. Please provide a database adapter before using auth APIs.')
  },
  async findMany() {
    throw new Error('Auth adapter is not configured. Please provide a database adapter before using auth APIs.')
  },
  async update() {
    throw new Error('Auth adapter is not configured. Please provide a database adapter before using auth APIs.')
  },
  async delete() {
    throw new Error('Auth adapter is not configured. Please provide a database adapter before using auth APIs.')
  },
  async deleteMany() {
    throw new Error('Auth adapter is not configured. Please provide a database adapter before using auth APIs.')
  }
}

const authOptions: BetterAuthOptions = {
  database: unconfiguredAdapter
}

export const auth = betterAuth(authOptions) as ReturnType<typeof betterAuth>

export type AuthClient = typeof auth
