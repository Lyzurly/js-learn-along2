"use strict";
console.log("level 1 is ready!");
window.addEventListener("message", function (event) {
    console.log("Child Origin is set to", window.origin);
    // let result: Function = Function(event.data)
    var result = Function(event.data)();
});
