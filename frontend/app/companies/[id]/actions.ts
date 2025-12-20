'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { sendEmail } from '@/utils/mail'

export async function deleteCompany(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const id = formData.get('id') as string

  if (!user) {
    throw new Error('User not found')
  }

  const { error } = await supabase
    .from('usercompanyselections')
    .delete()
    .eq('company_id', id)
    .eq('user_id', user.id)

  if (error) {
    console.error('Error deleting company selection:', error)
    throw new Error('Failed to delete company')
  }

  revalidatePath('/companies')
  redirect('/companies')
}

// updateCompany is similar to addCompany but with update()
export async function updateCompany(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('User not found')
    }

    const id = formData.get('id') as string
    const name = formData.get('name') as string
    const url = formData.get('url') as string
    const status = formData.get('status') as string
    const motivation_level = parseInt(formData.get('motivation_level') as string)

    // 変更前の状態を取得
    const { data: oldSelection } = await supabase
      .from('usercompanyselections')
      .select('status')
      .eq('company_id', id)
      .eq('user_id', user.id)
      .single()

    // 企業情報の更新 (name, url)
    const { error: companyError } = await supabase
      .from('companies')
      .update({ name, url })
      .eq('id', id)
    
    if (companyError) {
        console.error('Error updating company info:', companyError)
        // 続行する（選択情報の更新は試みる）
    }

    // 選択情報の更新 (status, motivation_level)
    const { error } = await supabase
      .from('usercompanyselections')
      .update({ status, motivation_level })
      .eq('company_id', id)
      .eq('user_id', user.id)
    
    if (error) {
        console.error('Error updating company selection:', error)
        throw new Error('Failed to update company')
    }

    // ステータス変更通知
    if (oldSelection && oldSelection.status !== status && user?.email) {
        let subject = '';
        let message = '';

        if (status === 'ES_Submit') {
            subject = '【進捗】ESを提出しました';
            message = `${name}のエントリーシート提出を記録しました。お疲れ様でした！\n次のステップに向けて準備しましょう。`;
        } else if (status === 'Interview') {
            subject = '【進捗】面接に進みました！';
            message = `${name}のステータスを「面接選考中」に変更しました。\n面接日程や対策を忘れないように記録しましょう。`;
        } else if (status === 'Offer') {
            subject = '【祝】内定おめでとうございます！';
            message = `${name}から内定をいただきました！おめでとうございます！\n承諾期限や条件をしっかり確認しましょう。`;
        } else if (status === 'Rejected') {
            subject = '【記録】お見送り';
            message = `${name}の選考が終了しました。\nこの経験を次の選考に活かしましょう。`;
        }

        if (subject) {
            // メール送信（エラーが出ても処理は止めない）
            try {
                await sendEmail(user.email, subject, message);
            } catch (e) {
                console.error('Failed to send status update email', e);
            }
            
            // アプリ内通知
            await supabase.from('notifications').insert({
                user_id: user.id,
                title: subject,
                content: message,
                link: `/companies/${id}`
            });
        }
    }

    revalidatePath(`/companies/${id}`)
    revalidatePath('/companies')
    redirect(`/companies/${id}`)
}

