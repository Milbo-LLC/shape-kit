import type { schema } from '@shape-kit/db'

export type DbUser = typeof schema.users.$inferSelect
export type DbSession = typeof schema.sessions.$inferSelect
export type DbWorkspaceMembership = typeof schema.workspaceMemberships.$inferSelect
export type DbOrganizationMembership = typeof schema.organizationMemberships.$inferSelect

export interface SessionUser extends DbUser {
  roles: {
    organization: DbOrganizationMembership[]
    workspace: DbWorkspaceMembership[]
    highest: import('./roles.js').MemberRole
  }
}

export interface SessionResult {
  session: DbSession | null
  user: SessionUser | null
}
