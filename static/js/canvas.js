const fps = 60;
const width = window.innerWidth;
const height = window.innerHeight;

var socket = io();
var myId = "";

socket.on("connect", function (msg) {
  console.log(
    "socket.on 'connect': [" + msg + "]",
    " io.uri: ",
    socket.io.uri,
    " socket: ",
    socket
  );
});

socket.on("welcome", function (msg) {
  console.log("welcome");
  console.log(msg);
  myId = msg.id;
});

var canvas = document.querySelector("canvas");

const birdImg = new Image();
birdImg.src = "../images/bird.png"
const bird2Img = new Image();
bird2Img.src = "../images/bird2.png"
const backgroundImg = new Image();
backgroundImg.src = "../images/background.png"

canvas.width = width;
canvas.height = height;
var c = canvas.getContext("2d");

var speedFact = 6;

class Bird {
  constructor(id) {
    this.x = width/4;
    this.y = height / 2
    this.r = height*0.03;
    this.color = "yellow"
    this.velocity = 0;
    this.acceleration = 0.5
    this.id = id
  }
  draw(ctx) {
    // ctx.arc(this.x, this.y, this.r, 0, 2 * Math.PI);
    // ctx.fillStyle = this.color;
    // ctx.fill();
    this.id == 1 ? 
    ctx.drawImage(birdImg, this.x-(this.r * 2), (this.y-this.r * 2), this.r*4, this.r*4) : 
    ctx.drawImage(bird2Img, this.x-(this.r * 1.675), (this.y-this.r * 1.675), this.r*3.25, this.r*3.25);
  }
  jump(progress) {
    this.velocity = progress * this.acceleration
    this.move(progress)
  }
  fall(progress) {
    this.velocity -= this.acceleration
    this.move(progress) 
  }
  moveBack(progress) {
    this.x -= this.progress/speedFact;
  }
  move(progress) {
    this.y -= this.velocity
  }
}

function generatePipe(){
  console.log("sending pipe signal")
  socket.emit("pipe", { sender: myId});
}

function pipeDraw(pipe) {
  c.fillStyle = pipe.color;
  c.fillRect(pipe.x, pipe.topY, pipe.w, pipe.h1);
  c.fillRect(pipe.x, pipe.botY, pipe.w, pipe.h2);
}
function pipeMove(pipe, progress) {
  pipe.x -= progress/speedFact;
}

var bird1 = new Bird(1);
var bird2 = new Bird(2);
var pipes = [];

var score = 0;
var highScore = 0;

var playerOneScore = 0;
var playerTwoScore = 0;
var startGame = false;

var lastRender = 0;
var p1IsOver = true;
var p2IsOver = true;
var p1SpacePressed = false;
var p2SpacePressed = false;
var pipeSpacingFactor = 2.5;


function handleSpaceInput(){
  socket.emit("jump", { sender: myId });
}


socket.on("pipe", function (msg) {
  var sender = "anybody";
  if (msg.from) {
    sender = msg.from;
  }
  var sentMsg = "secret chat message";
  if (msg.text) {
    sentMsg = msg.text;
  }
  p = msg.pipe;
  p.w = p.w * width
  p.gap = p.gap * height
  p.x = width+10;
  p.h1 = p.percent * height
  p.botY = 0 + p.h1 + p.gap
  p.h2 = height - p.h1 - p.gap
  console.log("Pipe-sender: " + sender, ", pipe: ", p);
  pipes.push(p);
})

socket.on("jump", function (msg) {
  var sender = "anybody";
  if (msg.from) {
    sender = msg.from;
  }
  var sentMsg = "secret chat message";
  if (msg.text) {
    sentMsg = msg.text;
  }

  console.log("Jump-sender: " + sender, ", sentMsg: " + sentMsg);

  if (sender === 1) {
    if(p1IsOver) {
      p1IsOver = false;
    }
    p1SpacePressed = true;
  } else if (sender === 2) {
    if(p2IsOver) {
      p2IsOver = false;
    }
    p2SpacePressed = true;
  }

  if(sender === 1 || sender === 2) {
    if(!startGame && !p2IsOver && !p1IsOver) {
      pipes = [];
      if(myId === 1) generatePipe();
      playerOneScore = 0;
      playerTwoScore = 0;
      startGame = true
      p1SpacePressed = true;
      p2SpacePressed = true;
    }
  }
});

window.onload = () => {
  runGame();
  document.addEventListener("keydown", e => {
    if (e.code === "Space") {
      handleSpaceInput();
    }
  });
}

socket.on("over", function (msg) {
  var sender = "anybody";
  if (msg.from) {
    sender = msg.from;
  }
  var sentMsg = "secret chat message";
  if (msg.text) {
    sentMsg = msg.text;
  }

  console.log("Over-sender: " + sender, ", sentMsg: " + sentMsg);

  if (sender === 1) {
    p1IsOver = true;
  } else if (sender === 2) {
    p2IsOver = true;
  }
  if(p1IsOver && p2IsOver) {
    startGame = false;
  }
});

function hitObject(){
  if(myId === 1) p1IsOver = true;
  if(myId === 2) p2IsOver = true;
  socket.emit("over", { sender: myId });
}

function checkForCollision(nearestPipe){
  if(nearestPipe === undefined) return
  if(myId === 1) {
    if(p1IsOver) return
    if(bird1.y + bird1.r >= height) {
      hitObject();
    }
    if((bird1.x + bird1.r >= nearestPipe.x && bird1.x - bird1.r <= nearestPipe.x + nearestPipe.w) && (bird1.y - bird1.r <= nearestPipe.h1 || bird1.y + bird1.r >= nearestPipe.botY))  {
      hitObject();
  }
  } else if(myId === 2) {
    if(p2IsOver) return
    if(bird2.y + bird2.r >= height) {
      hitObject();
    }
    if((bird2.x + bird2.r >= nearestPipe.x && bird2.x - bird2.r <= nearestPipe.x + nearestPipe.w) && (bird2.y - bird2.r <= nearestPipe.h1 || bird2.y + bird2.r >= nearestPipe.botY))  {
      hitObject();
  }
  }
}


function update(progress) {
  // console.log(progress)
  if(startGame && (!p2IsOver || !p1IsOver)) {
    if(!p1IsOver) {
      if(p1SpacePressed) { //handle jump
        bird1.jump(progress)      
      } else {
        bird1.fall(progress)
      } 
    } else {
      bird1.moveBack(progress)
    }
    if(!p2IsOver) {
      if (p2SpacePressed) {
        bird2.jump(progress)
      } else {
        bird2.fall(progress)
      }
    } else {
      bird2.moveBack(progress)
    }
    var nearestPipe = pipes[0]
    pipes.forEach(pipe => { // handle pipes
      // console.log(pipe)
      pipeMove(pipe, progress)
      if(nearestPipe.x + pipe.w < bird1.x - bird1.r) {
        if(!nearestPipe.passed) {
          nearestPipe.passed = true;
          playerOneScore += 1
        }
        nearestPipe = pipe
      } else if(nearestPipe.x + pipe.w < bird2.x - bird2.r) {
        if(!nearestPipe.passed) {
          nearestPipe.passed = true;
          playerTwoScore += 1
        }
        nearestPipe = pipe
      }
    })
    // nearestPipe.color = "red"
    if (pipes.length > 0 && pipes[pipes.length - 1].x <= width - (width / pipeSpacingFactor)) {
      if(myId === 1) generatePipe()
    }
    if (pipes.length > 0 && pipes[0].x < 0 - pipes.w + 10) {
      pipes.shift()
    }
    checkForCollision(nearestPipe)
  } else {
    bird1.y = height / 2
    bird2.y = height / 2
    bird1.x = width / 4
    bird2.x = width / 4
    pipes = []
  }
  p1SpacePressed = false;
  p2SpacePressed = false;
}
var prevWidth = c.lineWidth
function draw() {
  c.beginPath();
  c.lineWidth = prevWidth;
  c.clearRect(0, 0, width, height)

  c.drawImage(backgroundImg, 0, 0, width, height);

  pipes.forEach(pipe => {
    pipeDraw(pipe)
  })

  if(myId === 1) {
    c.globalAlpha = 0.5;
    bird2.draw(c);
    c.globalAlpha = 1;
    bird1.draw(c);
  } else if(myId === 2) {
    c.globalAlpha = 0.5;
    bird1.draw(c);
    c.globalAlpha = 1;
    bird2.draw(c);
  }
  
  if(startGame && (!p2IsOver || !p1IsOver)) {
    c.beginPath();
    c.fillStyle = "white";
    c.strokeStyle = "black";
    c.font = "40px Arial";
    c.textAlign = "center"
    c.fillText("Player-1: " + playerOneScore.toString() +"     Player-2: " + playerTwoScore.toString() , width/2, 60);
    c.strokeText("Player-1: " + playerOneScore.toString() +"     Player-2: " + playerTwoScore.toString() , width/2, 60);
  } else {



    c.beginPath();
    c.strokeStyle = "lightyellow"
    c.moveTo(width/16 * 3,height/2);
    c.lineTo(width/16 * 1,height/2);
    c.lineWidth = 5;
    c.lineCap = "round";
    c.stroke();

    c.beginPath();
    c.strokeStyle = "yellow"
    c.moveTo(width/16 * 5,height/2);
    c.lineTo(width/16 * 7,height/2);
    c.lineCap = "square";
    c.stroke();
  }

}

function loop(timestamp) {
  var progress = timestamp - lastRender

  update(progress)
  draw()

  lastRender = timestamp
  window.requestAnimationFrame(loop)
  
}
function runGame() { 
  window.requestAnimationFrame(loop)
}
