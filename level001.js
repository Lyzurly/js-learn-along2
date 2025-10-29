"use strict";
var person = document.getElementById("person");
var coins = document.getElementsByClassName("coin");
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
    var coin_to_collect = coinCollected();
    if (coin_to_collect) {
        updateCoin(coin_to_collect);
        coins_ele.innerHTML = incrementCoins(coins_val);
    }
});
function coinCollected() {
    var collided_coin = null;
    Object.entries(coins).forEach(function (DOMCoin) {
        var hasCollected = false;
        if (DOMCoin[1].className != "hidden") {
            hasCollected = playerGotCoin(DOMCoin[1]);
        }
        if (hasCollected) {
            collided_coin = DOMCoin[1];
        }
    });
    return collided_coin;
}
function playerGotCoin(coin_to_get) {
    var coin_got = false;
    var rect_person = person.getBoundingClientRect();
    var rect_coin = coin_to_get.getBoundingClientRect();
    if (rect_person.x < rect_coin.right &&
        rect_person.y < rect_coin.bottom &&
        rect_person.right > rect_coin.x &&
        rect_person.bottom > rect_coin.y) {
        coin_got = true;
    }
    return coin_got;
}
function updateCoin(coin_to_update) {
    coin_to_update.className = "hidden";
}
function incrementCoins(string_to_inc) {
    var value = parseInt(string_to_inc, 10);
    var new_val = +(value += 1);
    var new_val_as_string = Math.floor(new_val).toString(10);
    return new_val_as_string;
}
// TODO: use this to check collision, but do it flash card style :>
// this.position.x < other.position.x + other.width &&
// this.position.x + this.width > other.position.x &&
// this.position.y < other.position.y + other.height &&
// this.position.y + this.height > other.position.y
