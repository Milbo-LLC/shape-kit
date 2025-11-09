export const memberRoles = ['admin', 'designer', 'viewer'] as const

export type MemberRole = (typeof memberRoles)[number]

const roleRank: Record<MemberRole, number> = {
  admin: 3,
  designer: 2,
  viewer: 1
}

export const compareRoles = (a: MemberRole, b: MemberRole) => roleRank[a] - roleRank[b]

export const highestRole = (roles: MemberRole[]): MemberRole => {
  if (!roles.length) return 'viewer'
  return roles.reduce((current, candidate) => (compareRoles(candidate, current) > 0 ? candidate : current))
}

export const hasRequiredRole = (role: MemberRole, allowed: MemberRole[]) => {
  if (!allowed.length) return false
  const normalized = Array.from(new Set<MemberRole>(allowed))
  return normalized.some((allowedRole) => compareRoles(role, allowedRole) >= 0)
}
