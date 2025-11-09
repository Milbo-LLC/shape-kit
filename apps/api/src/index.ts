import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { trpcServer } from '@trpc/server/adapters/hono'

import {
  honoAuthMiddleware,
  type AuthBindings,
  refreshSession,
  requireSession
} from '@shape-kit/auth'
import {
  createContextFromHono,
  createRouter,
  protectedProcedure,
  publicProcedure
} from '@shape-kit/trpc'

const app = new Hono<{ Variables: AuthBindings }>()

const router = createRouter({
  health: publicProcedure.query(() => ({ status: 'ok' })),
  me: protectedProcedure.query(({ ctx }) => ctx.auth.user)
})

app.use('*', honoAuthMiddleware())

app.get('/', async (c) => {
  const auth = c.get('auth')
  return c.json({ message: 'Hello from Shape Kit API', session: auth })
})

app.post('/auth/refresh', async (c) => {
  const { refreshToken } = await c.req.json<{ refreshToken: string }>()
  const result = await refreshSession(refreshToken)
  if (!result) {
    return c.json({ error: 'invalid_refresh_token' }, 401)
  }
  return c.json({
    accessToken: result.accessToken,
    refreshToken: result.refreshToken,
    user: result.user
  })
})

app.get('/auth/session', async (c) => {
  try {
    const session = await requireSession(c.req.raw)
    return c.json({ session })
  } catch (error) {
    return c.json({ error: 'unauthorized' }, 401)
  }
})

app.use(
  '/trpc/*',
  trpcServer({
    router,
    createContext: ({ req }) =>
      createContextFromHono({
        auth: req.ctx.get('auth') ?? { session: null, user: null }
      })
  })
)

const port = Number(process.env.PORT ?? 3001)

serve({
  fetch: app.fetch,
  port
})
