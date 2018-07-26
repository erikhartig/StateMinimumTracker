// Daniel Michelin
// 7/26/2018
//
// userController.js:
// 	Controls user creation, deletion, and updates

const exports = module.exports;
const sjcl = require('sjcl');

// Handles user creation
exports.postUser = function(req, res){
	console.log("user being created");
	if (!(req.body.username != "" && req.body.password != "")) {
		alert('username or password is empty');
		throw 'username or password is empty';
	}
	const saltBits = sjcl.random.randomWords(8);
	const encodedSalt = sjcl.codec.base64.fromBits(saltBits);
	const bitArray = sjcl.hash.sha256.hash(req.body.password, saltBits, 1000, 256);
	const digest_sha256 = sjcl.codec.hex.fromBits(bitArray);

	console.log(digest_sha256);
	con.query("INSERT INTO users (username, hashed_password, salt) VALUES (?,  ?, ?)", [req.body.username, digest_sha256, encodedSalt], function(err, result, fields) {
	          if (err) throw err;
	          res.status(200);
	          res.send(req.body.username);
	});
};

// Handles user deletion
exports.deleteUser = function(req, res){
	
	res.send('NOT IMPLEMENTED YOU FUCK');
};
