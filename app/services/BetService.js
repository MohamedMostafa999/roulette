var Promise = require("bluebird");
var BetModel = require("../models/bet");
var mongoose = require("mongoose");
var _ = require('underscore');
//simple service

module.exports.createBet = function (payload) {
    if (payload && payload.round && payload.number && payload.amount) {
        return BetModel.create({
            round: payload.round,
            number: payload.number,
            amount: payload.amount,
            timestamp: Date.now()
        });
    } else {
        return Promise.reject('improper payload');
    }
}

//so this function should be filterd by user or round or both and have some sort of pagenation
//asking for the whole collections shouldnt happen in production 
module.exports.listBets = function (payload) {
    return BetModel.find({});

}

module.exports.resolveBets = function (payload) { //resolved the pervious round bets
    ///now this could be better accomplished as another thread or even using the $out to a temp collection
    //then spawn an instance that copies the collection back to the main one 
    return BetModel.aggregate(
        [{ $match: { round: payload.round, success: { "$exists": false } } }, {
            $addFields: {
                success: { $cond: { if: { $eq: ["$number", payload.winningNumber] }, then: true, else: false } },
                outcome: { $cond: { if: { $eq: ["$number", payload.winningNumber] }, then: { $subtract: [{ $multiply: ["$amount", 36] }, "$amount"] }, else: "$amount" } }
            }
        }]
    ).exec().then(function (data) {
        if (data.length > 0) {
            var batch = BetModel.collection.initializeUnorderedBulkOp();
            data.forEach(function (obj) {              //cpu/memory intensive on large data should be it's own worker 
                var updateObject = _.omit(obj, "_id"); //or use a stragety that work on db side
                batch.find({ _id: obj._id }).upsert().update({ $set: updateObject });
            });
            return batch.execute(); //only one call
        } else {
            return Promise.resolve(true);
        }
    });
}



module.exports.getBalance = function (payload) { //just aggregates the balance (assuming one user)
    return BetModel.aggregate([
        // should be filterd by user or round or timestamp 
        {
            $project: {
                round: "$round",
                value:
                { $cond: { if: { $eq: ["$success", true] }, then: "$outcome", else: { $multiply: ["$outcome", -1] } } }
            }
        },
        {
            $group:
            {
                _id: null,
                balance: { $sum: "$value" }
            }
        }
    ]).exec();

}