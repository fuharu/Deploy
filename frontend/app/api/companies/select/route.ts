import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const company_id = formData.get('company_id') as string
    const status = formData.get('status') as string
    const motivation_level = parseInt(formData.get('motivation_level') as string)

    if (!company_id || !status) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // public.users にユーザーが存在するか確認し、なければ作成
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('id', user.id)
      .single()

    if (!existingUser) {
      const { error: userCreateError } = await supabase
        .from('users')
        .insert({
          id: user.id,
          email: user.email || '',
          name: user.user_metadata?.name || user.user_metadata?.full_name || 'ユーザー',
          university: user.user_metadata?.university || '未設定',
        })

      if (userCreateError) {
        console.error('Error creating user in public.users:', userCreateError)
      }
    }

    // 既に登録されているか確認
    const { data: existingSelection } = await supabase
      .from('usercompanyselections')
      .select('id')
      .eq('user_id', user.id)
      .eq('company_id', company_id)
      .single()

    if (existingSelection) {
      return NextResponse.json({ error: 'この企業は既に登録されています' }, { status: 400 })
    }

    // ユーザーの選択状況として登録
    const { error } = await supabase.from('usercompanyselections').insert({
      company_id,
      user_id: user.id,
      status,
      motivation_level,
    })

    if (error) {
      console.error('Error adding company selection:', error)
      return NextResponse.json(
        { error: `Failed to add company selection: ${error.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}

