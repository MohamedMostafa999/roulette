var app = angular.module('app', []);

app.controller("mainCtrl", function ($scope, $http) {
    $scope.round = 0 ;
    $scope.errMsgs = [];
    $scope.serverErrorMsg = '';
    $scope.bet={
        round:1,
        number:20,
        amount:10
    }//just some defaults
    if (webSocket !== undefined && webSocket.readyState !== WebSocket.CLOSED) {
        writeResponse("WebSocket is already opened.");

    }
    // Create a new instance of the websocket
    var webSocket = new WebSocket("ws://localhost:3000/");

    
    // adding some eventHandlers to websocker events
 
    webSocket.onopen = function (event) {
        console.log("connection open");
    };

    webSocket.onmessage = function (event) { //applying the message
        var object = JSON.parse(event.data);
        $scope.$apply(function(){$scope.round = object.round;});
    };

    webSocket.onclose = function (event) {
        console.log("Connection closed");
    };
    //initalize a bet request
    $scope.initBet = function(){
     if($scope.isBetValid()){
         var payload = JSON.stringify($scope.bet);
        var request = {
            "url": "/api/v1/createBet",
            "method": "POST",
            "data": payload,
            headers: {'Content-Type':'application/json'}
        };
        $scope.serverErrorMsg='';
        $scope.data='';
        $http(request).then(function (response) {
             $scope.data=response.data
        },function (error) {
            $scope.serverErrorMsg = error.data;
            console.log("an error occured " + JSON.stringify(error));
        });
        
     }
    }
    //validate the bet in the simplest way (should probably use angular validation )
    $scope.isBetValid = function(){
        $scope.errMsgs = [];
        if($scope.bet.round > 0 &&
        ($scope.bet.number <=36 && $scope.bet.number >=0 )&&
        ($scope.bet.amount >0 && $scope.bet.amount <=100)){
        return true;
    }else{
        if(!$scope.bet.round > 0 ) $scope.errMsgs.push("Round number must be greater than zero");
        if(!($scope.bet.number <=36 && $scope.bet.number >=0 )) $scope.errMsgs.push("Bet Number should be between 0 and 36");
        if(! ($scope.bet.amount >0 && $scope.bet.amount <=100)) $scope.errMsgs.push("Bet Amount should be between 1 and 100")
        return false;
    }
    
    }

     $scope.listBets = function(){
            var request = {
            "url": "/api/v1/listBets",
            "method": "POST",
            headers: {'Content-Type':'application/json'}
        };
       
        $http(request).then(function (response) {
             $scope.tableData=response.data
             $scope.tableKeys= Object.keys(response.data[0]); //just populations for rendering
        },function (error) {
            $scope.serverErrorMsg = error.data;
            console.log("an error occured " + JSON.stringify(error));
        });
     }



     //requesting the balance (runs the aggregate in the backend)
     $scope.getBalance = function(){
            var request = {
            "url": "/api/v2/getBalance",
            "method": "POST",
            headers: {'Content-Type':'application/json'}
        };
       
        $http(request).then(function (response) {
             $scope.balance=response.data[0].balance;
        },function (error) {
            $scope.serverErrorMsg = error.data;
            console.log("an error occured " + JSON.stringify(error));
        });
     }
     $scope.tableValues= function(row){
         return Object.values(row);
     }

});