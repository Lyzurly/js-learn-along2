"use strict";
var person = document.getElementById("person");
console.log("level 1 is ready!");
window.addEventListener("message", function (event) {
  console.log("Child Origin is set to", window.origin);
  var result = Function(event.data)();
});
// TODO: use this to check collision, but do it flash card style :>
// this.position.x < other.position.x + other.width &&
// this.position.x + this.width > other.position.x &&
// this.position.y < other.position.y + other.height &&
// this.position.y + this.height > other.position.y

person.style.translate = "500px";
