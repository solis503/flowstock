import { createServerSupabase } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import Sidebar from '@/components/Sidebar'

export const dynamic = 'force-dynamic'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  let role = 'none'
  let businessData: any = null
  let branches: any[] = []

  const { data: ownerBiz } = await supabase.from('businesses').select('*').eq('owner_id', user.id).single()
  if (ownerBiz) {
    businessData = ownerBiz
    role = 'owner'
    const { data: br } = await supabase.from('branches').select('id, name').eq('business_id', ownerBiz.id)
    branches = br || []
  } else {
    const { data: profile } = await supabase.from('profiles').select('*, businesses(*), branches(*)').eq('user_id', user.id).eq('active', true).single()
    if (profile) {
      role = profile.role
      businessData = profile.businesses
      if (profile.businesses) {
        const { data: br } = await supabase.from('branches').select('id, name').eq('business_id', profile.businesses.id)
        branches = br || []
      }
    } else {
      redirect('/login')
    }
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        userName={user.email || 'Usuario'}
        businessName={businessData?.name || 'Mi Negocio'}
        userRole={role}
        branches={branches}
        currentBranch={branches[0]?.id}
      />
      <main className="flex-1 overflow-y-auto bg-gray-50">
        <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  )
}
