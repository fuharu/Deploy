import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()

    // すべての企業を取得（業界情報も含む）
    const { data: companies, error } = await supabase
      .from('companies')
      .select('id, name, url, address, industry')
      .order('name', { ascending: true })

    if (error) {
      return NextResponse.json(
        { error: `Failed to fetch companies: ${error.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({ companies: companies || [] })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

