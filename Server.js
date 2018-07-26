/*
Author: Erik Hartig
Date: 11/15/17
Code that creates a node js web server that implements a restful api
**/

const https = require('https');
const fs = require('fs');
var mysql = require('mysql');
var express = require('express');
var request = require('request');
var sjcl = require('sjcl');
var bodyParser = require('body-parser');

var app = express();
//creates a connection object to allow access to the database
var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "password",
  database: "songapp"
});

//creating settings for the http body parser
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json({
  type: 'application/json'
}));

//setting up the port and routing information
var port = process.env.PORT || 80;
var router = express.Router();

router.use(function(req, res, next) {
  // do logging
  console.log('Something is happening.');
  next(); // make sure we go to the next routes and don't stop here
});

//A basic test function that can be used to see if the api is functioning
router.get('/', function(req, res) {
  res.json({
    message: 'hooray! welcome to our api!'
  });
});

//Allows the creating of a new user through a post request
router.route('/users')

  .post(function(req, res) {
    console.log("user being created");
    if (!(req.body.username != "" && req.body.password != "")) {
      alert('username or password is empty');
      throw 'username or password is empty';
    }
    var saltBits = sjcl.random.randomWords(8);
    var encodedSalt = sjcl.codec.base64.fromBits(saltBits);
    var bitArray = sjcl.hash.sha256.hash(req.body.password, saltBits, 1000, 256);
    var digest_sha256 = sjcl.codec.hex.fromBits(bitArray);

    console.log(digest_sha256);
    con.query("INSERT INTO users (username, hashed_password, salt) VALUES (?,  ?, ?)", [req.body.username, digest_sha256, encodedSalt], function(err, result, fields) {
      if (err) throw err;
      res.status(200);
      res.send(req.body.username);
    });
  });

//allows a user to logout by passing a session id
router.route('/login/:id')

  .delete(function(req, res) {
    con.query("delete from sessions where id = ?", req.params.id, function(err, result, fields) {
      if (err) throw err;
      res.status(200);
      res.end();
    });
  });

//Allows a user to login and returns a session id
router.route('/login')

  .post(function(req, res) {
    var sql = "select * from users WHERE username = ?";
    var inserts = [req.body.username];
    sql = mysql.format(sql, inserts);
    con.query(sql, function(err, result, fields) {
      if (err) throw err;
      var saltBits = sjcl.codec.base64.toBits(result[0].salt);
      var hashedPassword = sjcl.hash.sha256.hash(req.body.password, saltBits, 1000, 256);
      var digest_sha256 = sjcl.codec.hex.fromBits(hashedPassword);
      if (req.body.username == result[0].username && digest_sha256 == result[0].hashed_password) {
        if (result[0].refresh_token !== null) {}
        var sessionId = sjcl.random.randomWords(16);
        var sessionIdHex = sjcl.codec.hex.fromBits(sessionId);
        con.query("DELETE FROM sessions where user_id = ?", result[0].id, function(err, result, fields) {
          if (err) throw err;
        });
        con.query("INSERT INTO sessions (id, user_id) VALUES (?, ?)", [sessionIdHex, result[0].id], function(err, result, fields) {
          if (err) throw err;
          res.status(200);
          res.send(String(sessionIdHex));
        }); //add fields for refresh token token and refresh time
      } else {
        res.status(400);
        res.send("incorrect username or password");
        throw 'incorrect username or password';
      }
    });
  });

app.use('/api', router);
app.listen(port);
console.log('Magic happens on port ' + port);

//checks to see if the user provided session id is valid
function verifyLogin(sessionId) {
  verifyString(sessionId);
  var sql = "select * from sessions where id = ?";
  var inserts = [sessionId];
  sql = mysql.format(sql, inserts);
  con.query(sql, function(err, result, fields) {
    if (err) throw err;
    if (result.length == 1) {
      return result[0].user_id;
    } else {
      throw 'Session id is invalid';
    }
  });
}

//checks to see if a string contains invalid characters
function verifyString(str) {
   if (/^[a-zA-Z0-9- ]*$/.test(str) == false) {
      throw 'Contains invalid characters';
   }
}
