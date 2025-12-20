import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // クエリパラメータからフィルタ条件を取得
    const status = searchParams.get('status')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // 企業データを取得
    let queryBuilder = supabase
      .from('usercompanyselections')
      .select('*, companies!inner(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (status && status !== 'all') {
      queryBuilder = queryBuilder.eq('status', status)
    }

    if (startDate) {
      queryBuilder = queryBuilder.gte('created_at', startDate)
    }

    if (endDate) {
      queryBuilder = queryBuilder.lte('created_at', endDate)
    }

    const { data: selections, error } = await queryBuilder

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // CSV形式に変換
    const headers = ['企業名', 'URL', 'ステータス', '志望度', '登録日時']
    const statusLabels: { [key: string]: string } = {
      Interested: '気になる',
      Entry: 'エントリー',
      ES_Submit: 'ES提出済',
      Interview: '面接選考中',
      Offer: '内定',
      Rejected: 'お見送り',
    }

    const csvRows = [
      headers.join(','),
      ...(selections || []).map((selection: any) => {
        const company = selection.companies
        const row = [
          `"${company.name.replace(/"/g, '""')}"`,
          `"${(company.url || '').replace(/"/g, '""')}"`,
          `"${statusLabels[selection.status] || selection.status}"`,
          selection.motivation_level.toString(),
          `"${new Date(selection.created_at).toLocaleString('ja-JP')}"`,
        ]
        return row.join(',')
      }),
    ]

    const csv = csvRows.join('\n')
    const bom = '\uFEFF' // BOM for Excel compatibility

    return new NextResponse(bom + csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="companies_${new Date().toISOString().split('T')[0]}.csv"`,
      },
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Export failed' }, { status: 500 })
  }
}

