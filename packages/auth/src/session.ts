import { randomBytes, randomUUID } from 'node:crypto'

import { and, eq } from 'drizzle-orm'

import { db, schema } from '@shape-kit/db'

import { signJwt, verifyJwt } from './jwt.js'
import { highestRole } from './roles.js'
import type { MemberRole } from './roles.js'
import type { SessionResult, SessionUser } from './types.js'

const ACCESS_TOKEN_TTL_SECONDS = 60 * 60
const REFRESH_TOKEN_TTL_SECONDS = 60 * 60 * 24 * 30

const getSecret = () => {
  const secret = process.env.AUTH_SECRET
  if (!secret) {
    throw new Error('AUTH_SECRET environment variable must be configured for authentication helpers.')
  }
  return secret
}

const toDate = (value: Date | string) => (value instanceof Date ? value : new Date(value))

const parseAuthorizationToken = (input: Headers | Request | null | undefined) => {
  if (!input) return null
  const headers = input instanceof Request ? input.headers : input
  const authHeader = headers.get('authorization')
  if (authHeader && authHeader.toLowerCase().startsWith('bearer ')) {
    return authHeader.slice(7).trim()
  }
  const cookieHeader = headers.get('cookie') ?? ''
  const cookies = cookieHeader.split(';').map((part) => part.trim())
  const sessionCookie = cookies.find((cookie) => cookie.startsWith('shape_session='))
  if (sessionCookie) {
    const [, value] = sessionCookie.split('=').map((part) => part.trim())
    return value || null
  }
  return null
}

const buildSessionUser = async (userId: string): Promise<SessionUser | null> => {
  const [user] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.id, userId))
    .limit(1)
    .execute()

  if (!user) {
    return null
  }

  const organizationMemberships = await db
    .select()
    .from(schema.organizationMemberships)
    .where(eq(schema.organizationMemberships.userId, userId))
    .execute()

  const workspaceMemberships = await db
    .select()
    .from(schema.workspaceMemberships)
    .where(eq(schema.workspaceMemberships.userId, userId))
    .execute()

  const allRoles = [...organizationMemberships, ...workspaceMemberships].map(
    (membership) => membership.role as MemberRole
  )

  return {
    ...user,
    roles: {
      organization: organizationMemberships,
      workspace: workspaceMemberships,
      highest: highestRole(allRoles)
    }
  }
}

export async function validateSession(
  input: Headers | Request | null | undefined
): Promise<SessionResult> {
  const token = parseAuthorizationToken(input)
  if (!token) {
    return { session: null, user: null }
  }

  let payload: { sessionId: string; userId: string }
  try {
    payload = verifyJwt(token, getSecret())
  } catch (error) {
    return { session: null, user: null }
  }

  const [session] = await db
    .select()
    .from(schema.sessions)
    .where(and(eq(schema.sessions.id, payload.sessionId), eq(schema.sessions.userId, payload.userId)))
    .limit(1)
    .execute()

  if (!session) {
    return { session: null, user: null }
  }

  if (toDate(session.expiresAt).getTime() <= Date.now()) {
    return { session: null, user: null }
  }

  const user = await buildSessionUser(payload.userId)

  return { session, user }
}

export async function requireSession(input: Headers | Request | null | undefined) {
  const result = await validateSession(input)
  if (!result.session || !result.user) {
    throw new Error('Authentication required')
  }
  return result
}

const generateRefreshToken = () => randomBytes(32).toString('hex')

const issueJwt = (userId: string, sessionId: string) =>
  signJwt({ sessionId, userId }, getSecret(), ACCESS_TOKEN_TTL_SECONDS)

export interface RefreshSessionResult extends SessionResult {
  accessToken: string
  refreshToken: string
}

export async function refreshSession(refreshToken: string): Promise<RefreshSessionResult | null> {
  if (!refreshToken) {
    return null
  }

  const [session] = await db
    .select()
    .from(schema.sessions)
    .where(eq(schema.sessions.refreshToken, refreshToken))
    .limit(1)
    .execute()

  if (!session) {
    return null
  }

  if (toDate(session.refreshExpiresAt).getTime() <= Date.now()) {
    return null
  }

  const expiresAt = new Date(Date.now() + ACCESS_TOKEN_TTL_SECONDS * 1000)
  const refreshExpiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_SECONDS * 1000)
  const newAccessToken = issueJwt(session.userId, session.id)
  const newRefreshToken = generateRefreshToken()

  const [updated] = await db
    .update(schema.sessions)
    .set({
      token: newAccessToken,
      refreshToken: newRefreshToken,
      expiresAt,
      refreshExpiresAt,
      updatedAt: new Date()
    })
    .where(eq(schema.sessions.id, session.id))
    .returning()
    .execute()

  const user = await buildSessionUser(session.userId)

  return {
    session: updated ?? session,
    user,
    accessToken: newAccessToken,
    refreshToken: newRefreshToken
  }
}

export async function persistSessionToken(userId: string): Promise<RefreshSessionResult> {
  const sessionId = randomUUID()
  const expiresAt = new Date(Date.now() + ACCESS_TOKEN_TTL_SECONDS * 1000)
  const refreshExpiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_SECONDS * 1000)
  const accessToken = issueJwt(userId, sessionId)
  const refreshToken = generateRefreshToken()

  const [session] = await db
    .insert(schema.sessions)
    .values({
      id: sessionId,
      userId,
      token: accessToken,
      refreshToken,
      expiresAt,
      refreshExpiresAt,
      createdAt: new Date(),
      updatedAt: new Date()
    })
    .returning()
    .execute()

  const user = await buildSessionUser(userId)

  return {
    session,
    user,
    accessToken,
    refreshToken
  }
}
