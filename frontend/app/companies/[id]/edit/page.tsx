import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { redirect, notFound } from 'next/navigation'
import { updateCompany } from '../actions'

export default async function EditCompanyPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { id } = await params

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: company, error } = await supabase
    .from('companies')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !company) notFound()

  return (
    <div className="container mx-auto p-8 max-w-2xl">
      <Link href={`/companies/${id}`} className="text-blue-500 hover:underline mb-4 inline-block">
        &larr; キャンセルして戻る
      </Link>
      <h1 className="text-2xl font-bold mb-6">企業情報の編集</h1>

      <form action={updateCompany} className="flex flex-col gap-6 border p-8 rounded-lg bg-white shadow-sm">
        <input type="hidden" name="id" value={company.id} />
        
        <label className="flex flex-col gap-2">
          <span className="font-medium">企業名 <span className="text-red-500">*</span></span>
          <input 
            name="name" 
            type="text" 
            required 
            defaultValue={company.name}
            className="border rounded px-3 py-2" 
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="font-medium">URL</span>
          <input 
            name="url" 
            type="url" 
            defaultValue={company.url || ''}
            className="border rounded px-3 py-2" 
          />
        </label>
        
        <div className="grid grid-cols-2 gap-4">
             <label className="flex flex-col gap-2">
              <span className="font-medium">ステータス</span>
              <select 
                name="status" 
                defaultValue={company.status}
                className="border rounded px-3 py-2"
              >
                <option value="Interested">気になる</option>
                <option value="Entry">エントリー</option>
                <option value="ES_Submit">ES提出済</option>
                <option value="Interview">面接</option>
                <option value="Offer">内定</option>
                <option value="Rejected">お祈り</option>
              </select>
            </label>

            <label className="flex flex-col gap-2">
              <span className="font-medium">志望度 (1-5)</span>
              <input 
                name="motivation_level" 
                type="number" 
                min="1" 
                max="5" 
                defaultValue={company.motivation_level}
                className="border rounded px-3 py-2" 
              />
            </label>
        </div>

        <button type="submit" className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition font-medium">
          更新する
        </button>
      </form>
    </div>
  )
}

