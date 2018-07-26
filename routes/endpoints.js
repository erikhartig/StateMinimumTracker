var express = require('express');
var router = express.Router();

// Require controller modules.
var login_controller = require('../controllers/loginController');
var user_controller = require('../controllers/userController');


/// LOGIN ROUTES ///

//POST USER
router.post('/users/post', user_controller.post);

//POST LOGIN
router.post('/login/post', login_controller.post);

//DELETE Login

router.delete('/login/delete', login_controller.delete);

module.exports = router;
