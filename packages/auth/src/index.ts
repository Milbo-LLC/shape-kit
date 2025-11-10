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

const authConfig = betterAuth({
  database: drizzleAdapter(db, schema),
  providers: [
    google({
      clientId: googleClientId,
      clientSecret: googleClientSecret
    })
  ]
})

export const auth: ReturnType<typeof betterAuth> = authConfig

export type AuthClient = typeof auth

