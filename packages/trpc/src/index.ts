import { initTRPC } from '@trpc/server'

const t = initTRPC.context<unknown>().create()

export const createRouter = t.router
export const publicProcedure = t.procedure

export type RouterFactory = typeof createRouter
