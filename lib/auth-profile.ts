export function profileFromAuthUser(user:any){return {name:user?.user_metadata?.full_name||user?.email?.split('@')[0]||'Pilot'}}
