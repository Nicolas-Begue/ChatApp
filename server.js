//* REQUIRE EXPRESS/HTTP/SOCKET.IO *//
var express = require("express");
var app = express();
var http = require("http").Server(app);
var io = require("socket.io")(http);

var users = [];

//* REDIRECTION DU SERVEUR HTTP VERS LES FICHIERS DU DOSSIER PUBLIC *//
app.use("/", express.static(__dirname + "/public"));

//* DÉMARRAGE DU SERVEUR SUR LE PORT 3000 *//
http.listen(3000, function () {
  console.log("Server is listening on *:3000");
});

//* CONNECTION A SOCKET.IO *//
io.on("connection", function (socket) {
  //* DÉCLARATION DES VARIABLES *//
  var heureMsg;
  var whatSocketId;
  var myStatus;
  var myUsername;
  var loggedUser;

  //** AFFICHAGE DES UTILISATEURS EN LIGNE**/
  for (i = 0; i < users.length; i++) {
    socket.emit("user-login", users[i]);
  }
  //* RÉCUPÉRATION DE L'HEURE DU MESSAGE *//
  socket.on("time", function (timeMsg) {
    heureMsg = timeMsg;
  });
  //* RÉCUPÉRATION DE L'ID DE L'ENVOYEUR *//
  socket.on("mySocketId", function (mySocketId) {
    whatSocketId = mySocketId;
  });
  //* GESTION DE LA DÉCONNEXION *//
  socket.on("disconnect", function () {
    if (loggedUser !== undefined) {
      console.log(loggedUser.username + " vient de se déconnecter");
      var serviceMessage = {
        text: loggedUser.username + " vient de se déconnecter",
        type: "logout",
      };
      socket.broadcast.emit("service-message", serviceMessage);
      var userIndex = users.indexOf(loggedUser);
      if (userIndex !== -1) {
        users.splice(userIndex, 1);
      }
      // Emission d'un 'user-logout' contenant le user
      io.emit("user-logout", loggedUser);
    }
  });
  //* GESTION DU STATUS DE L'UTILISATEUR *//
  socket.on("status", function (status) {
    myStatus = status;
    console.log(myStatus);
  });
  //* RÉCUPÉRATION DU NOM D'UTILISATEUR *//
  socket.on("username", function (username) {
    myUsername = username;
  });
  //* GESTION DE LA CONNEXION D'UN NOUVEL UTILISATEUR *//
  socket.on("user-login", function (user) {
    loggedUser = user;
    if (loggedUser !== undefined) {
      var serviceMessage = {
        text: loggedUser.username + " vient de se connecter",
        type: "login",
      };
      socket.broadcast.emit("service-message", serviceMessage);
    }
  });
  socket.on("user-login", function (user, callback) {
    // Vérification que l'utilisateur n'existe pas
    var userIndex = -1;
    for (i = 0; i < users.length; i++) {
      if (users[i].username === user.username) {
        userIndex = i;
      }
    }
    if (user !== undefined && userIndex === -1) {
      // S'il est bien nouveau
      // Sauvegarde de l'utilisateur et ajout à la liste des connectés
      loggedUser = user;
      users.push(loggedUser);
      // Envoi des messages de service
      var userServiceMessage = {
        text: 'Vous êtes connecté en tant que "' + loggedUser.username + '"',
        type: "login",
      };
      socket.emit("service-message", userServiceMessage);
      // Emission de 'user-login' et appel du callback
      io.emit("user-login", loggedUser);
      callback(true);
    } else {
      callback(false);
    }
  });
  //* GESTION ET ENVOIE DU MESSAGES ET DE SES COMPOSANTS *//
  socket.on("message", function (message) {
    message.username = loggedUser.username;
    message.status = myStatus;
    message.heure = heureMsg;
    message.whatSocketId = whatSocketId;
    io.emit("message", message);
  });
});
