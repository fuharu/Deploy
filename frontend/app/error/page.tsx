import Link from 'next/link'

export default async function ErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  // Next.js 15: searchParams is a Promise
  const params = await searchParams
  const message = params?.message

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <h1 className="text-2xl font-bold text-red-600">Error</h1>
      <p>Sorry, something went wrong</p>
      {message && (
        <div className="p-4 bg-gray-100 rounded text-red-500 font-mono text-sm border border-red-200">
          {message as string}
        </div>
      )}
      <Link href="/login" className="text-blue-500 hover:underline">
        ログイン画面に戻る
      </Link>
    </div>
  )
}
