import React from 'react'

const LoadingDots = () => {
  return (
    <div className="flex space-x-2">
      <div className="w-1 h-1 bg-blue-500 rounded-full animate-scale"></div>
      <div className="w-1 h-1 bg-blue-500 rounded-full animate-scale animation-delay-100"></div>
      <div className="w-1 h-1 bg-blue-500 rounded-full animate-scale animation-delay-200"></div>
    </div>
  )
}

export default LoadingDots
