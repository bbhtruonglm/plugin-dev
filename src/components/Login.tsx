import React, { useState } from 'react'
interface LoginProps {
  setUserName: (e: any) => void
}
function Login({ setUserName }: LoginProps) {
  const [loginId, setLoginId] = useState('')
  const onSubmit = (e: any) => {
    e.preventDefault()
    setUserName(loginId)
  }
  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-r from-gray-800 to-gray-900 w-full">
      <div className="w-1/3 bg-white rounded-lg p-8">
        <h2 className="text-2xl font-bold mb-4">Login</h2>
        <form
          action=""
          onSubmit={onSubmit}
        >
          <div className="mb-4">Name</div>
          <div className="flex justify-between">
            <input
              type="text"
              id="name"
              placeholder="Enter your name"
              onChange={(e) => setLoginId(e.target.value)}
              className="border rounded-md px-2"
            />
            <button
              className="bg-blue-400 p-2 rounded-md text-white cursor-pointer"
              type="submit"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Login
