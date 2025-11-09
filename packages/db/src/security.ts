import { and, eq, inArray } from 'drizzle-orm'

import type { DatabaseClient } from './index.js'
import { organizationMemberships, roleEnum, workspaceMemberships } from './schema.js'

export class AuthorizationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AuthorizationError'
  }
}

export type MemberRole = (typeof roleEnum.enumValues)[number]

const roleOrder: MemberRole[] = ['viewer', 'designer', 'admin']

const normalizeRoles = (roles: MemberRole[]): MemberRole[] => {
  const unique = new Set<MemberRole>()
  roles.forEach((role) => {
    if (roleOrder.includes(role)) {
      unique.add(role)
    }
  })
  return Array.from(unique)
}

export async function requireOrganizationRole(
  db: DatabaseClient,
  params: { organizationId: string; userId: string; roles?: MemberRole[] }
) {
  const roles = normalizeRoles(params.roles ?? roleEnum.enumValues)
  const membership = await db
    .select()
    .from(organizationMemberships)
    .where(
      and(
        eq(organizationMemberships.organizationId, params.organizationId),
        eq(organizationMemberships.userId, params.userId),
        inArray(organizationMemberships.role, roles)
      )
    )
    .limit(1)
    .execute()

  if (!membership.length) {
    throw new AuthorizationError('User does not have permission for this organization')
  }

  return membership[0]
}

export async function requireWorkspaceRole(
  db: DatabaseClient,
  params: { workspaceId: string; userId: string; roles?: MemberRole[] }
) {
  const roles = normalizeRoles(params.roles ?? roleEnum.enumValues)
  const membership = await db
    .select()
    .from(workspaceMemberships)
    .where(
      and(
        eq(workspaceMemberships.workspaceId, params.workspaceId),
        eq(workspaceMemberships.userId, params.userId),
        inArray(workspaceMemberships.role, roles)
      )
    )
    .limit(1)
    .execute()

  if (!membership.length) {
    throw new AuthorizationError('User does not have permission for this workspace')
  }

  return membership[0]
}
