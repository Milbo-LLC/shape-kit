import { initTRPC, TRPCError } from '@trpc/server'

import type { AuthBindings } from '@shape-kit/auth'
import { hasRequiredRole } from '@shape-kit/auth'
import type { MemberRole, SessionResult } from '@shape-kit/auth'

export interface TrpcContext {
  auth: SessionResult
}

export const createContext = (auth: SessionResult): TrpcContext => ({ auth })

const t = initTRPC.context<TrpcContext>().create()

export const createRouter = t.router
export const publicProcedure = t.procedure

export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.auth.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Authentication required' })
  }
  return next({ ctx })
})

export const roleProtectedProcedure = (roles: MemberRole[]) =>
  protectedProcedure.use(({ ctx, next }) => {
    const highest = ctx.auth.user?.roles.highest ?? 'viewer'
    if (!hasRequiredRole(highest, roles)) {
      throw new TRPCError({ code: 'FORBIDDEN', message: 'Insufficient role permissions' })
    }
    return next({ ctx })
  })

export const createContextFromHono = (bindings: AuthBindings): TrpcContext => ({
  auth: bindings.auth ?? { session: null, user: null }
})

export type RouterFactory = typeof createRouter
