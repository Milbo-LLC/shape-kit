import { createAuth } from 'better-auth'

export const auth = createAuth({
  session: {
    strategy: 'jwt'
  }
})

export type AuthClient = typeof auth
