var router = require('express').Router();
var BetController = require("../controllers/BetController");

router.use('/createBet',BetController.createBet);
router.use('/listBets',BetController.listBets);







module.exports= router;


