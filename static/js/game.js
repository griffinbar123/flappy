// IT325
// GRiffin barnard
// socket.io example for 4 clients and keyboard events
// this is the browser / client
//
$(function () {
  var columnCount = 4;
  var columns = [];
  for (i = 0; i < columnCount; i++) {
    columns[i] = $("#c" + i);
  }
  var socket = io();
  var myId = "";

  $("#b1").click(function (e) {
    socket.emit("bb", { sender: myId, text: "button1" });
    console.log("b1 button clicked. socket.emit('bb')");
  });

  $("#m").keydown(function (e) {
    socket.emit("bb", { sender: myId, text: "key: " + e.key });
    socket.emit("chat", { sender: myId, text: "key: " + e.key });
    $("#m").val("");
    return false;
  });

  
  $("form").submit(function (e) {
    e.preventDefault(); // prevents page reloading
    if (!myId) myId = "";

    socket.emit("chat", { sender: myId, text: $("#m").val() });
    $("#m").val("");
    return false;
  });

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

  socket.on("chat", function (msg) {
    var sender = "anybody";
    if (msg.from) {
      sender = msg.from;
    }
    var sentMsg = "secret chat message";
    if (msg.text) {
      sentMsg = msg.text;
    }

    $("#l" + sender).prepend($("<li>").text(sentMsg));
  });
});
