var router = require('express').Router();
var BetController = require('../controllers/BetController');

router.use('/getBalance',BetController.getBalance);


module.exports= router;
