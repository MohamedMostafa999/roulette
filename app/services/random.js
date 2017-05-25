//just a simple function factory 
module.exports.randomNumber = function (min, max) {
    return function () {
        return Math.floor(Math.random() * (max - min)) + min;
    }

}