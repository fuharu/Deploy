import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { redirect, notFound } from 'next/navigation'
import { EditCompanyForm } from '@/components/features/companies/EditCompanyForm'

export default async function EditCompanyPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { id } = await params

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // 企業情報と選択状況を取得
  const { data: selection } = await supabase
    .from('usercompanyselections')
    .select('*, companies!inner(*)')
    .eq('company_id', id)
    .eq('user_id', user.id)
    .single()

  if (!selection) notFound()

  const company = {
    ...selection.companies,
    status: selection.status,
    motivation_level: selection.motivation_level,
    id: selection.company_id
  }

  return (
    <div className="container mx-auto p-8 max-w-2xl min-h-screen bg-gray-50 dark:bg-gray-950">
      <Link href={`/companies/${id}`} className="text-indigo-500 dark:text-indigo-400 hover:underline mb-4 inline-block">
        &larr; キャンセルして戻る
      </Link>
      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">企業情報の編集</h1>

      <EditCompanyForm company={company} />
    </div>
  )
}

