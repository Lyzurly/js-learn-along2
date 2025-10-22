"use strict";
console.log("level 1 is ready!");
var input_display_element = document.getElementById("level001Text");
window.addEventListener("message", function (event) {
    console.log("Child Origin is set to", window.origin);
    // let result: Function = Function(event.data)
    var result = Function(event.data)();
    if (input_display_element) {
        input_display_element.innerHTML = result;
    }
});
