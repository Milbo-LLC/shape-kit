import { betterAuth, type Adapter, type BetterAuthOptions } from 'better-auth'

import { drizzleAdapter } from './adapter.js'

const authOptions = {
  database: drizzleAdapter as unknown as Adapter
} satisfies BetterAuthOptions

type BetterAuthClient = ReturnType<typeof betterAuth>

export const auth: BetterAuthClient = betterAuth(authOptions)

export type AuthClient = typeof auth

export { drizzleAdapter }
export * from './middleware.js'
export * from './roles.js'
export * from './session.js'
export * from './types.js'
