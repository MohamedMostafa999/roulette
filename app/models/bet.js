var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var BetSchema = new Schema({
  round:Number,
  number:Number,
  amount:Number,
  timestamp:{type:Date,default:Date.now},
  success:Boolean,
  outcome:Number
});

module.exports = mongoose.model('Bet', BetSchema);
