import { createAdminClient } from '@/utils/supabase/admin'
import { NextResponse } from 'next/server'

export async function GET() {
    try {
        // Service Role Keyを使用してRLSポリシーをバイパス
        const supabase = createAdminClient()

        // 業界一覧を取得
        const { data: industries, error } = await supabase
            .from('industries')
            .select('id, industries')
            .order('industries', { ascending: true })

        if (error) {
            console.error('Error fetching industries:', error)
            return NextResponse.json(
                { 
                    error: `Failed to fetch industries: ${error.message}`,
                    code: error.code,
                    details: error.details
                },
                { status: 500 }
            )
        }

        console.log('Industries fetched successfully:', industries?.length || 0, 'items')
        return NextResponse.json({ industries: industries || [] })
    } catch (error: any) {
        console.error('Unexpected error in /api/industries:', error)
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        )
    }
}

