import { createHmac, randomBytes } from 'node:crypto'

type JwtPayload = Record<string, unknown>

const base64UrlEncode = (input: Buffer | string) => {
  const buffer = typeof input === 'string' ? Buffer.from(input) : input
  return buffer
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
}

const base64UrlDecode = (input: string) => {
  const pad = 4 - (input.length % 4 || 4)
  const normalized = `${input}${'='.repeat(pad === 4 ? 0 : pad)}`.replace(/-/g, '+').replace(/_/g, '/')
  return Buffer.from(normalized, 'base64')
}

export const generateSecret = () => base64UrlEncode(randomBytes(32))

export function signJwt(payload: JwtPayload, secret: string, expiresInSeconds: number) {
  const header = { alg: 'HS256', typ: 'JWT' }
  const now = Math.floor(Date.now() / 1000)
  const body = { ...payload, exp: now + expiresInSeconds, iat: now }
  const headerEncoded = base64UrlEncode(JSON.stringify(header))
  const payloadEncoded = base64UrlEncode(JSON.stringify(body))
  const data = `${headerEncoded}.${payloadEncoded}`
  const signature = createHmac('sha256', secret).update(data).digest('base64url')
  return `${data}.${signature}`
}

export function verifyJwt<TPayload extends JwtPayload>(token: string, secret: string) {
  const parts = token.split('.')
  if (parts.length !== 3) {
    throw new Error('Invalid JWT token')
  }
  const [headerEncoded, payloadEncoded, signature] = parts
  const data = `${headerEncoded}.${payloadEncoded}`
  const expected = createHmac('sha256', secret).update(data).digest('base64url')
  if (expected !== signature) {
    throw new Error('JWT signature mismatch')
  }

  const payload = JSON.parse(base64UrlDecode(payloadEncoded).toString()) as TPayload & {
    exp?: number
  }

  if (!payload.exp || payload.exp * 1000 < Date.now()) {
    throw new Error('JWT expired')
  }

  return payload
}
