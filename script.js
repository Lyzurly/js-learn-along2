"use strict";
var debug_script = "thisErrorIsForFun.js";
var level_canvas = document.getElementById("level-canvas");
var input_area = document.getElementById("jsInput");
var level001_path = "level001.html";
var level001_iframe;
var level001_window;
var sandbox_params;
var correct_origin;
checkIfDebug();
function checkIfDebug() {
    console.log("Parent Origin is set to", window.origin);
    fetch(debug_script).then(function (response) {
        if (response.statusText === "OK") {
            sandbox_params = "allow-same-origin allow-scripts";
            correct_origin = "http://127.0.0.1:5500";
            createLevel();
            console.log("Origin should be set to: ", correct_origin);
        }
        else {
            sandbox_params = "allow-scripts";
            if (window.origin === "https://hypergamedev.itch.io" ||
                "https://html-classic.itch.zone") {
                correct_origin = "*";
                createLevel();
                console.log("Origin should be set to: ", correct_origin);
            }
            else if (window.origin === "https://hypergame.dev") {
                correct_origin = "https://hypergame.dev";
                createLevel();
                console.log("Origin should be set to: ", correct_origin);
            }
            else {
                console.log("Origin not guessed good! Surprise, it was ", window.origin);
                console.log("Origin should be set to: ", correct_origin);
            }
        }
    });
}
function createLevel() {
    var new_iframe = create_element("iframe", "level", "level001");
    new_iframe.setAttribute("title", "Level 1");
    new_iframe.setAttribute("src", level001_path);
    new_iframe.setAttribute("sandbox", sandbox_params);
    // Access this in devtools via element.style on the iframe
    new_iframe.style.display = "flex";
    new_iframe.style.width = "100%";
    new_iframe.style.height = "120%";
    level_canvas === null || level_canvas === void 0 ? void 0 : level_canvas.appendChild(new_iframe);
    level001_iframe = new_iframe;
    createInputListener();
}
function createInputListener() {
    input_area.addEventListener("change", function (event) {
        var _a;
        var input_to_send = input_area.value;
        (_a = level001_iframe.contentWindow) === null || _a === void 0 ? void 0 : _a.postMessage(input_to_send, correct_origin);
    });
}
// TODO: Add an attributes param that take multiple params
function create_element(element_type, class_name, id_name) {
    if (class_name === void 0) { class_name = ""; }
    if (id_name === void 0) { id_name = ""; }
    var element_itself = document.createElement(element_type);
    if (class_name !== "") {
        if (class_name.includes(" ")) {
            addClassesToElement(element_itself, class_name);
        }
        else {
            element_itself.classList.add(class_name);
        }
    }
    if (id_name !== "") {
        element_itself.id = id_name;
    }
    return element_itself;
}
function addClassesToElement(element, string_to_split) {
    var class_names = string_to_split.split(" ");
    class_names.forEach(function (split_class) {
        element.classList.add(split_class);
    });
}
