// IT325 Spring 2020
// Brent Reeves
// socket.io example for 4 clients
//
const express = require("express");
const path = require("path");
const app = express();
var http = require("http").createServer(app);
var io = require("socket.io")(http);
var port = process.env.PORT || 3000;
const production = false;

app.use(express.static(path.join(__dirname, "./static")));

app.get("/", function (req, res) {
  res.sendFile(__dirname + "./index.html");
});

var clients = new Map();
var clientId = 0;

function aKey(aSocket) {
  if (production) return aSocket.handshake.address;
  else return aSocket.id;
}

class Pipe {
  constructor() {
    this.x = 1000
    this.topY = 0
    this.w = 0.075
    this.gap = 0.25;
    this.h1 = 0
    this.botY = 0
    this.h2 = 0
    this.color = "green"
    this.passed = false;
    this.percent = randomPercentFromInterval();
  }
}


io.on("connection", function (socket) {
  clientId += 1;
  var aKey = socket.id;
  clients.set(aKey, { id: clientId });
  console.log(
    "connection: " + socket.id + " clientId: " + clientId + " key: " + aKey
  );
  socket.emit("welcome", { id: clientId });

  // socket.on("disconnect", function () {
  //   clients.delete(aKey);
  //   console.log(
  //     "disconnect: " + socket.id + " clientId: " + clientId + " key: " + aKey
  //   );
  //   clientId -= 1;
  // })

  socket.on("jump", function (msg) {
    var info = clients.get(socket.id);

    io.emit("jump", { from: info.id }); // io.emit sends to all
    console.log("jump command received from " + info.id);
  });

  socket.on("over", function (msg) {
    var info = clients.get(socket.id);

    io.emit("over", { from: info.id }); // io.emit sends to all
    console.log("over command received from " + info.id);
  });

  socket.on("pipe", function (msg) {
    var info = clients.get(socket.id);

    io.emit("pipe", { from: info.id, pipe: new Pipe() }); // io.emit sends to all
    console.log("pipe command received from " + info.id);
  });
});

http.listen(port, function () {
  console.log("listening on port " + port);
});

function randomPercentFromInterval(min, max) { 
  num = Math.random()
  while(num < 0.05 || num > 0.55) {
    num = Math.random()
  }
  return num
}