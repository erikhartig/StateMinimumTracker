var Login = require('../models/login');
exports.loginPost = function(req, res) {
  login(req, res);
}

exports.login = function(req, res) {
  let sql = "select * from users WHERE username = ?";
  let inserts = [req.body.username];
  sql = mysql.format(sql, inserts);
  con.query(sql, function(err, result, fields) {
    if (err) throw err;
    let saltBits = sjcl.codec.base64.toBits(result[0].salt);
    let hashedPassword = sjcl.hash.sha256.hash(req.body.password, saltBits, 1000, 256);
    let digest_sha256 = sjcl.codec.hex.fromBits(hashedPassword);
    if (req.body.username == result[0].username && digest_sha256 == result[0].hashed_password) {
      if (result[0].refresh_token !== null) {}
      let sessionId = sjcl.random.randomWords(16);
      let sessionIdHex = sjcl.codec.hex.fromBits(sessionId);
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
}
