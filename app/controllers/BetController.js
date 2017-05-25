var BetService = require("../services/BetService");

//just a simple http controller
module.exports.createBet = function (req, res) {
    var payload = req.body;
    if (payload && payload.round != global.round){ //casted
        res.status(400).json("bets are only accepted on current round");
    } else {
        BetService.createBet(payload).then(function (data) {
            res.json({ betId: data._id });
        }).catch(function (err) {
            res.json(err);
        });
    }
}

module.exports.listBets = function (req, res) {
   BetService.listBets().then(function(data){
       res.json(data);
   }).catch(function(err){
       console.log(err);
       res.status(500).json(err);
   })

}

module.exports.getBalance = function(req,res){
   BetService.getBalance().then(function(data){
       res.json(data);
   }).catch(function(err){
       console.log(err);
       res.status(500).json(err);
   })
}