import type { MiddlewareHandler } from 'hono'

import { requireSession, validateSession } from './session.js'
import type { SessionResult } from './types.js'

export interface AuthBindings {
  auth: SessionResult
}

export const honoAuthMiddleware = (): MiddlewareHandler => async (c, next) => {
  const result = await validateSession(c.req.raw)
  c.set('auth', result)
  await next()
}

export const honoRequireAuth = (): MiddlewareHandler => async (c, next) => {
  const result = await requireSession(c.req.raw)
  c.set('auth', result)
  await next()
}

export async function getNextServerSession() {
  let module: any
  try {
    module = await import('next/headers')
  } catch (error) {
    throw new Error('getNextServerSession is only available in a Next.js server runtime')
  }

  const requestHeaders: Headers = new Headers(module.headers())
  const cookies = module.cookies()
  const sessionCookie = cookies.get?.('shape_session')?.value
  if (sessionCookie) {
    requestHeaders.set('cookie', `shape_session=${sessionCookie}`)
  }

  return validateSession(requestHeaders)
}
