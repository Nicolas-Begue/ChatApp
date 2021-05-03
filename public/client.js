var socket = io();

//* FONCTION COULEUR DU CHAT *//
function color() {
  var myColor = $(".myColor").val();
  $(".myMessage").css("background", myColor);
  $(".chatColor").css("display", "none");
}

//** FONCTION SETTINGS **/
function settings() {
  $(".chatColor").css("display", "block");
}

//* FONCTION CONNEXION *//
function connexion() {
  var username = $(".prenom").val() + " " + $(".nom").val();
  var user = { username: username.trim() };
  if (user.username.length > 0) {
    socket.emit("user-login", user, function (success) {
      if (success) {
        $("body").removeAttr("id");
        $("#login").css("display", "none");
        $(".main").css("display", "block");
        $(".navbar").css("display", "block");
        $(".deconnexion").css("display", "block");
        $(".myUsername").html(username);
      }
    });
  } else {
    alert("Veuillez entrer un nom d'utilisateur");
  }
  socket.emit("username", username);
  $(".messageInput").focus();
}

//* FONCTION DECONNEXION *//
function deconnexion() {
  $("body").attr("id", "logged-out");
  $("#login").css("display", "block");
  $(".main").css("display", "none");
  $(".navbar").css("display", "none");
  $(".usernameInput").val("");
  $(".usernameInput").focus();
  window.location.reload();
}

//* FONCTION MESSAGE : RÉCUPÉRATION ET ENVOI DES INFOS *//
function message() {
  var messageInput = $(".messageInput").val();
  var date = new Date();
  var heure = date.getHours();
  var minutes = date.getMinutes();
  var mySocketId = socket.id;
  socket.emit("mySocketId", mySocketId);
  if (messageInput.trim() !== "") {
    if ($(".usernameInput").val() !== "") {
      var message = {
        text: messageInput,
      };
      var time = heure + ":" + minutes;
      var timeMsg = time.toString();
      socket.emit("time", timeMsg);
      socket.emit("message", message);
      $(".messageInput").val("");
    } else {
      alert("Veuillez entrer en nom d'utilisateur");
    }
  }
  $(".messageInput").focus();
}

//* MESSAGE DE CONNEXION ET DE DÉCONNEXION *//
socket.on("service-message", function (message) {
  $(".messages").append($('<li class ="' + message.type + '">').html(message.text));
  $(".chatCol").animate({ scrollTop: 100000 });
});

socket.on("user-login", function (loggedUser) {
  var userClass = loggedUser.username.replace(/\s+/g, "");
  $("#users").append($('<li class="' + userClass + ' new">').html(loggedUser.username + " <i class='fas fa-circle onlineStatus' style='color: green;'></i>"));
  setTimeout(function () {
    $("#users li.new").removeClass("new");
  }, 1000);
});

socket.on("user-logout", function (loggedUser) {
  var selector = "#users li." + loggedUser.username.replace(/\s+/g, "");
  $(selector).remove();
});

//* RÉCUPÉRATION ET AFFICHAGE DU MESSAGE FINAL *//
socket.on("message", function (message) {
  if (socket.id === message.whatSocketId) {
    $(".messages").append(
      $("<li class='myMessage' onmouseover='displayHourOn()' onmouseout='displayHourOff()'>").html(
        "<span class='username'>" +
          message.username +
          " <i class='fas fa-circle onlineStatus' style='color:" +
          message.status +
          ";'></i></span> " +
          "<span class=messageHour> à " +
          message.heure +
          "</span>" +
          "<br/>" +
          message.text
      )
    );
    $(".colorButton").click();
    $(".chatCol").animate({ scrollTop: 100000 });
  } else {
    $(".messages").append(
      $("<li class='otherMessage' onmouseover='theirHourOn()' onmouseout='theirHourOff()'>").html(
        "<span class='username'>" +
          message.username +
          " <i class='fas fa-circle onlineStatus' style='color:" +
          message.status +
          ";'></i></span> " +
          "<span class=theirMessageHour> à " +
          message.heure +
          "</span>" +
          "<br/>" +
          message.text
      )
    );
    $(".chatCol").animate({ scrollTop: 100000 });
  }
});

//* GESTION DE L'EVENEMENT ENTRÉE *//
$(".messageInput").keyup(function (event) {
  if (event.keyCode === 13) {
    $(".sendButton").click();
  }
});
$(".prenom").keyup(function (event) {
  if (event.keyCode === 13) {
    $(".connexion").click();
  }
});
$(".nom").keyup(function (event) {
  if (event.keyCode === 13) {
    $(".connexion").click();
  }
});
