import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function DELETE(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { ids } = await request.json()

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    // usercompanyselectionsから削除
    const { error } = await supabase
      .from('usercompanyselections')
      .delete()
      .eq('user_id', user.id)
      .in('company_id', ids)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Bulk delete failed' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { ids, status } = await request.json()

    if (!Array.isArray(ids) || ids.length === 0 || !status) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    // usercompanyselectionsのステータスを一括更新
    const { error } = await supabase
      .from('usercompanyselections')
      .update({ status })
      .eq('user_id', user.id)
      .in('company_id', ids)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Bulk update failed' }, { status: 500 })
  }
}

