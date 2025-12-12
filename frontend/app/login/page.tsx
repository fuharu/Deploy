import { login, signup } from './actions'

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <form className="flex flex-col gap-4 w-full max-w-md border p-8 rounded-lg shadow-sm bg-white">
        <h1 className="text-2xl font-bold mb-4 text-center">ログイン / 新規登録</h1>
        
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Email</span>
          <input 
            id="email" 
            name="email" 
            type="email" 
            required 
            className="border rounded px-3 py-2"
          />
        </label>
        
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Password</span>
          <input 
            id="password" 
            name="password" 
            type="password" 
            required 
            className="border rounded px-3 py-2"
          />
        </label>
        
        <div className="flex flex-col gap-2 mt-4">
          <button formAction={login} className="bg-blue-600 text-white rounded px-4 py-2 hover:bg-blue-700 transition">
            ログイン
          </button>
          <button formAction={signup} className="bg-gray-100 text-gray-800 rounded px-4 py-2 hover:bg-gray-200 transition">
            新規登録
          </button>
        </div>
      </form>
    </div>
  )
}

