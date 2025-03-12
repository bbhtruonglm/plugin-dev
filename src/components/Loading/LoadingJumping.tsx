const LoadingJumping = () => {
  return (
    <div className="ml-2 flex">
      <span className="w-2 h-2 bg-blue-500 rounded-full animate-jumping mx-1"></span>
      <span
        className="w-2 h-2 bg-blue-500 rounded-full animate-jumping mx-1"
        style={{ animationDelay: '0.15s' }}
      ></span>
      <span
        className="w-2 h-2 bg-blue-500 rounded-full animate-jumping mx-1"
        style={{ animationDelay: '0.3s' }}
      ></span>
    </div>
  )
}

export default LoadingJumping
