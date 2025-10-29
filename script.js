"use strict";
var debug_script = "thisErrorIsForFun.js";
var level_canvas = document.getElementById("levelCanvas");
var level_size_x = "600";
var level_size_y = "220";
var input_area = document.getElementById("jsInput");
var button_try = document.getElementById("buttonTry");
var button_start_over = document.getElementById("buttonStartOver");
var tries_current_ele = document.getElementById("triesCurrent");
var tries_current_val = tries_current_ele.innerHTML;
var tries_total_ele = document.getElementById("triesTotal");
var tries_total_val = tries_total_ele.innerHTML;
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
createButtonListeners();
function createButtonListeners() {
    button_try.addEventListener("click", function (event) {
        sendUserInputToLevel();
        tries_current_val = incrementString(tries_current_val);
        tries_current_ele.innerHTML = tries_current_val;
    });
    button_start_over.addEventListener("click", function (event) {
        location.reload();
    });
}
function sendUserInputToLevel() {
    var _a;
    var input_to_send = input_area.value;
    (_a = level001_iframe.contentWindow) === null || _a === void 0 ? void 0 : _a.postMessage(input_to_send, correct_origin);
}
function incrementString(string_to_inc) {
    var value = parseInt(string_to_inc, 10);
    var new_val = +(value += 1);
    var new_val_as_string = Math.floor(new_val).toString(10);
    return new_val_as_string;
}
function createLevel() {
    var new_iframe = create_element("iframe", "level", "level001");
    new_iframe.setAttribute("title", "Level 1");
    new_iframe.setAttribute("src", level001_path);
    new_iframe.setAttribute("sandbox", sandbox_params);
    // Access this in devtools via element.style on the iframe
    new_iframe.style.display = "flex";
    new_iframe.style.width = level_size_x + "px";
    new_iframe.style.height = level_size_y + "px";
    level_canvas === null || level_canvas === void 0 ? void 0 : level_canvas.appendChild(new_iframe);
    level001_iframe = new_iframe;
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
