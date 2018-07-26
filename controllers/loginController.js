const mysql = require('mysql');
const express = require('express');
const request = require('request');
const sjcl = require('sjcl');
const bodyParser = require('body-parser');

const validForTime = 1800000 //how long a JWT is valid for in ms
var app = express();
//creates a connection object to allow access to the database
var con = mysql.createConnection({
   host: "localhost",
   user: "root",
   password: "dkbrifkvo759603",
   database: "statemin"
});

exports.loginPost = function(req, res) {
  login(req, res);
}

//Data not currently being validated, however is safe
exports.login = function(req, res) {
  let sql = "select * from users WHERE username = ??";
  let inserts = [req.body.username];
  sql = mysql.format(sql, inserts);
  con.query(sql, function(err, result, fields) {
    if (err) throw err;
    let saltBits = sjcl.codec.base64.toBits(result[0].salt);
    let hashedPassword = sjcl.hash.sha256.hash(req.body.password, saltBits, 1000, 256);
    let digest_sha256 = sjcl.codec.hex.fromBits(hashedPassword);
    if (req.body.username == result[0].username && digest_sha256 == result[0].hashed_password) {
      //construct header
      let header = {"alg":"SHA256", "typ":"JWT"};
      let encodedHeader = btoa(header);

      //construct payload
      let d = new Date();
      let currentTime = d.getTime();
      let expirationTime = currentTime + validForTime;
      let payload = {"iat":currentTime, "exp":expirationTime, "username":req.body.username, "permission":"basic"};
      let encodedPayload = btoa(payload);

      //construct signature
      let key = fs.readFileSync("./keysHMACSecretKey.txt"); // Either from an RBG or a PBKDF.
      let hmac = new sjcl.misc.hmac(key, sjcl.hash.sha256);
      let signature = hmac.encrypt(encodedHeader +"."+encodedPayload);

      let jwt = encodedHeader +"." + encodedPayload +"."+ signature;//unecrypted JWT using HMACSHA256
      
      res.send(jwt);
      }); //add fields for refresh token token and refresh time
    } else {
      res.status(400);
      res.send("incorrect username or password");
      throw 'incorrect username or password';
    }
  });
}
