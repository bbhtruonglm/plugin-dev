const LoadingJumping = () => {
  return (
    <div className="ml-2 flex">
      <span className="w-2 h-2 bg-blue-500 rounded-full animate-jumping mx-1"></span>
      <span className="w-2 h-2 bg-blue-500 rounded-full animate-jumping mx-1 delay-150"></span>
      <span className="w-2 h-2 bg-blue-500 rounded-full animate-jumping mx-1 delay-300"></span>
    </div>
  )
}

export default LoadingJumping
