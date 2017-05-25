var router = require("express").Router();
var v1 = require('./api_v1');
var v2 = require('./api_v2');



router.use('/v1', v1);//routing for v1 and v2 
router.use('/v2', v2);

router.use('/', function(req,res){//api default
    res.send("please use /v1 for version 1 or /v2 for version 2");
}); 

module.exports = router;
