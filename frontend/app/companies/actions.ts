'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function addCompany(formData: FormData) {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const name = formData.get('name') as string
  const url = formData.get('url') as string
  const status = formData.get('status') as string
  const motivation_level = parseInt(formData.get('motivation_level') as string)

  const { error } = await supabase.from('companies').insert({
    user_id: user.id,
    name,
    url,
    status,
    motivation_level,
  })

  if (error) {
    console.error('Error adding company:', error)
    throw new Error(`Failed to add company: ${error.message} (${error.code})`)
  }

  revalidatePath('/companies')
  redirect('/companies')
}

type SearchResult = {
  title: string
  link: string
  snippet: string
}

export async function searchCompany(query: string): Promise<SearchResult[]> {
  const backendUrl = process.env.BACKEND_URL || 'http://127.0.0.1:8000'
  
  try {
    const res = await fetch(`${backendUrl}/api/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
      cache: 'no-store'
    })

    if (!res.ok) {
      console.error('Backend search failed:', res.status, await res.text())
      return []
    }

    return await res.json()
  } catch (error) {
    console.error('Search error:', error)
    return []
  }
}

type PlaceResult = {
  name: string
  address: string
  rating: number | null
  user_ratings_total: number | null
  open_now: boolean | null
  photo_reference: string | null
}

export async function searchCafes(location: string): Promise<PlaceResult[]> {
  const backendUrl = process.env.BACKEND_URL || 'http://127.0.0.1:8000'
  
  try {
    const res = await fetch(`${backendUrl}/api/places/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ location }),
      cache: 'no-store'
    })

    if (!res.ok) {
      console.error('Backend places search failed:', res.status, await res.text())
      return []
    }

    return await res.json()
  } catch (error) {
    console.error('Search places error:', error)
    return []
  }
}
