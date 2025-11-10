import { db, schema } from '@shape-kit/db'
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { google } from 'better-auth/providers/google'

function getEnvValue(key: string) {
  const value = process.env[key]
  if (!value) {
    const message = `Missing required environment variable: ${key}`
    if (process.env.NODE_ENV === 'production') {
      throw new Error(message)
    }

    console.warn(message)
    return ''
  }

  return value
}

const googleClientId = getEnvValue('GOOGLE_CLIENT_ID')
const googleClientSecret = getEnvValue('GOOGLE_CLIENT_SECRET')

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    users: schema.users,
    sessions: schema.sessions,
    accounts: schema.accounts,
    verificationTokens: schema.verificationTokens
  }),
  providers: [
    google({
      clientId: googleClientId,
      clientSecret: googleClientSecret
    })
  ]
})

export type AuthClient = typeof auth

