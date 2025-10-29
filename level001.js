"use strict";
var person = document.getElementById("person");
var coins = document.getElementsByClassName("coin");
var taco = document.getElementById("taco");
var coins_to_win = "3";
var coins_ele = document.getElementById("goal_val_01");
var coins_val = coins_ele.innerHTML;
console.log("level 1 is ready!");
window.addEventListener("message", function (event) {
    console.log("Child Origin is set to", window.origin);
    var result = Function(event.data)();
});
var collisionTick = new Event("collisionTick");
setcollisionTick();
function setcollisionTick() {
    setInterval(function () {
        window.dispatchEvent(collisionTick);
    }, 1);
}
window.addEventListener("collisionTick", function (event) {
    handleCoins();
    handleTacos();
});
function handleCoins() {
    var coin_to_collect = coinCollected(); // assign if coin collected
    if (coin_to_collect) {
        // If a coin IS collected...
        updateCoin(coin_to_collect); // hide it
        coins_val = incrementCoins(coins_val); // inc coin count
        coins_ele.innerHTML = coins_val; // update coin count in html
    }
}
function handleTacos() {
    if (playerGotThing(taco) &&
        isString1GreaterThanString2(coins_val, coins_to_win) &&
        !taco.className.includes("hidden")) {
        console.log("Bought tacos!");
        taco.className += "hidden";
    }
    else {
        console.log("Can't buy tacos");
    }
}
function coinCollected() {
    var collided_coin = null;
    Object.entries(coins).forEach(function (DOMCoin) {
        var hasCollected = false;
        if (!DOMCoin[1].className.includes("hidden")) {
            hasCollected = playerGotThing(DOMCoin[1]);
        }
        if (hasCollected) {
            collided_coin = DOMCoin[1];
        }
    });
    return collided_coin;
}
function playerGotThing(thing_to_get) {
    var thing_got = false;
    var rect_person = person.getBoundingClientRect();
    var rect_thing = thing_to_get.getBoundingClientRect();
    if (rect_person.x < rect_thing.right &&
        rect_person.y < rect_thing.bottom &&
        rect_person.right > rect_thing.x &&
        rect_person.bottom > rect_thing.y) {
        thing_got = true;
    }
    return thing_got;
}
function updateCoin(coin_to_update) {
    coin_to_update.className += " hidden";
}
function incrementCoins(string_to_inc) {
    var value = parseInt(string_to_inc, 10);
    var new_val = +(value += 1);
    var new_val_as_string = Math.floor(new_val).toString(10);
    return new_val_as_string;
}
function isString1GreaterThanString2(number1, number2) {
    var number1_int = parseInt(number1, 10);
    var number2_int = parseInt(number2, 10);
    return number1_int >= number2_int;
}
// TODO: use this to check collision, but do it flash card style :>
// this.position.x < other.position.x + other.width &&
// this.position.x + this.width > other.position.x &&
// this.position.y < other.position.y + other.height &&
// this.position.y + this.height > other.position.y
