import { initTRPC } from '@trpc/server'

type TrpcContext = Record<string, never>

const t = initTRPC.context<TrpcContext>().create()

export const createRouter = t.router
export const publicProcedure = t.procedure

export type { TrpcContext }
export type RouterFactory = typeof createRouter
