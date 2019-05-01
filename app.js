const express = require('express')
const SocketIO = require('socket.io')
const app = express()

const fs = require('fs')

const Jimp = require('jimp')

const port = 3005

const server = app.listen(port, () => {
  console.log("server listening on port: ", port)
})

const io = SocketIO(server)

// const pixelData = [
//   ['red', 'aqua', 'blue', 'black', "pink"],
//   ['red', 'aqua', 'blue', 'black', "pink"],
//   ['red', 'aqua', 'blue', 'black', "pink"],
//   ['red', 'aqua', 'blue', 'black', "pink"],
//   ['red', 'aqua', 'blue', 'black', "pink"]
// ]

// const pixelData = fs.readFileSync('./pixelData.png', (err, data) => {
//   if (err) {
//     console.log("err")
//     return new Jimp(20, 20, 0xffff00ff)
//   } else {
//     return data
//   }
// })

async function main() {
  const pixelData = await Jimp.read('./pixelData.png')
  let onlineCount = 0

  io.on('connection', async (socket) => {
    onlineCount++
    // io.emit('online-count', 8)
    io.emit('online-count', onlineCount)
    

    //将图片数据转换为二进制buffer
    var pngBuffer = await pixelData.getBufferAsync(Jimp.MIME_PNG)
  
    socket.emit('initial-pixel-data', pngBuffer)
  
    socket.on('draw-dot', async ({row, col, color}) => {
      //将字符串颜色转换为十六进制颜色
      var hexColor = Jimp.cssColorToHex(color)
      pixelData.setPixelColor(hexColor, row, col)
  
      // pixelData[row][col] = color

      //服务器向其他客户端广播一个事件
      io.emit('update-dot', {row, col, color})
      //服务器自身接收该事件
      //socket.emit('update-dot', {row, col, color})
  
      var buf = await pixelData.getBufferAsync(Jimp.MIME_PNG)
      fs.writeFile('./pixelData.png', buf, (err) => {
        if (err) {
          console.log(err)
        } else {
          console.log('save pixel data success!')
        }
      })
  
    })
    socket.on('disconnect', () => {
      onlineCount--
      console.log('someone leaves')
    })
  })
}

main()
