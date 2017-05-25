'use strict';
//dependecies
var cluster = require('cluster');
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var expressWs = require('express-ws')(app);
var mongoose = require('mongoose');
var path = require('path');
var Promise = require('bluebird');
var config = require('config');
var gameConfigs = config.get('Game');
var DBConfigs = config.get("DB");
var serverConfigs = config.get('Server');
var BetService = require("./app/services/BetService");
var randomnumber = require('./app/services/random').randomNumber(gameConfigs.Min, gameConfigs.Max);
var numCPUs = require('os').cpus().length;
var round = 0, winningNumber = 0;


//check if master node
if (cluster.isMaster) {
    console.log(`Master ${process.pid} is running`);

    //init ws connections (no need to channel)
    app.ws('/', function (ws, req) {
        console.log('connected to ws client');
        ws.send(JSON.stringify({ round: round })); //give the client the current round on connection
        next();
    });
    var aWss = expressWs.getWss('/');
    //using a separate port for websocket
    app.listen(serverConfigs.Port, function () {
        console.log('server intialized on port ' + serverConfigs.Port);
    })

    var api = cluster.fork();//only one api worker 
    cluster.on('exit', (worker, code, signal) => {
        console.log(`worker ${worker.process.pid} died`);
    });
    var incrementRound = function () {
        round++;
        winningNumber = randomnumber();
        //sharing the values with the api
        api.send({ round: round, winningNumber: winningNumber });
        //the client payload
        var clientUpdatePayload = JSON.stringify({ round: round });
        //broadcast to all clients
        aWss.clients.forEach(function (client) { client.send(clientUpdatePayload) });

    }
    incrementRound();//inital incerement
    setInterval(function () {
        incrementRound();
    }, gameConfigs.RoundInterval);


} else {

    //listen to master updates
    function updateAndResolveRound(payload) {
        global.round = payload.round;
        winningNumber = payload.winningNumber;
        //the resolution should be on a separate worker but i put it here for simplicty
        //since the actual calculation is done on the mongodb side (please see comments on the resolve function)
        BetService.resolveBets({round:payload.round-1,
            winningNumber:payload.winningNumber}).catch(function(err){
                console.log(err);
            });
    }
    //we are just catching any message for simplicty
    process.on('message', updateAndResolveRound);

    //inits and db connections
    mongoose.connect(DBConfigs.uri);
    mongoose.Promise = require('bluebird');
    mongoose.connection.on('error', console.error.bind(console, 'connection error:'));
    mongoose.connection.once('open', function () {
        console.log("connected to db");
    });

    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());


    //routes
    app.use('/api', require("./app/routes/api"));//for the api routes 
    app.use('/', express.static('public'));//for the static html pages

    app.listen(serverConfigs.ApiPort, function () {
        console.log('Api server intialized on port ' + serverConfigs.ApiPort);
    })
}