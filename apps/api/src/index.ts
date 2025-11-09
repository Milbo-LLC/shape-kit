import { Hono } from 'hono'
import { serve } from '@hono/node-server'

const app = new Hono()

app.get('/', (c) => c.json({ message: 'Hello from Shape Kit API' }))

const port = Number(process.env.PORT ?? 3001)

serve({
  fetch: app.fetch,
  port
})
