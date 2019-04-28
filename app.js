const express = require('express')
const SocketIO = require('socket.io')
const app = express()

const port = 3005

const server = app.listen(port, () => {
  console.log("server listening on port: ", port)
})

const io = SocketIO(server)

const pixelData = [
  ['red', 'aqua', 'blue', 'black'],
  ['red', 'aqua', 'blue', 'black'],
  ['red', 'aqua', 'blue', 'black'],
  ['red', 'aqua', 'blue', 'black']
]

io.on('connection', (socket) => {
  socket.emit('pixel-data', pixelData)

  socket.on('draw-dot', ({row, col, color}) => {
    pixelData[row][col] = color
    //服务器向其他客户端广播一个事件
    socket.broadcast.emit('updata-dot', {row, col, color})
    //服务器自身接收该事件
    socket.emit('updata-dot', {row, col, color})
  })
  socket.on('disconnect', () => {
    console.log('someone leaves')
  })
})