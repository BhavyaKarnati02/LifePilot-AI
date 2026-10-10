
export type AuthProfile = {
  name: string
  email: string
}

export function profileFromAuthUser(user: any): AuthProfile {
  return {
    name:
      user?.user_metadata?.full_name ||
      user?.email?.split('@')[0] ||
      'Pilot',
    email: user?.email || '',
  }
}