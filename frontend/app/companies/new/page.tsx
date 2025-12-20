import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { CompanySelectionForm } from '@/components/features/companies/CompanySelectionForm'

export default async function NewCompanyPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // ユーザーが既に登録している企業IDを取得
  const { data: userSelections } = await supabase
    .from('usercompanyselections')
    .select('company_id')
    .eq('user_id', user.id)

  const registeredCompanyIds = new Set(userSelections?.map(s => s.company_id) || [])

  return (
    <div className="container mx-auto p-8 max-w-4xl min-h-screen bg-gray-50 dark:bg-gray-950">
      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">企業新規登録</h1>
      <CompanySelectionForm
        registeredCompanyIds={Array.from(registeredCompanyIds)}
      />
    </div>
  )
}
