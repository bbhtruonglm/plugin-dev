const WebSocket = require('ws')

// Tạo WebSocket server lắng nghe trên cổng 8080
const wss = new WebSocket.Server({ port: 8080 })

wss.on('connection', (ws) => {
  console.log('Client connected')

  // Khi nhận tin nhắn từ client
  ws.on('message', (message) => {
    console.log(`Received: ${message}`)

    // Gửi tin nhắn lại cho tất cả các client đang kết nối
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message)
      }
    })
  })

  // Khi client ngắt kết nối
  ws.on('close', () => {
    console.log('Client disconnected')
  })
})

console.log('WebSocket server is running on ws://localhost:8080')
