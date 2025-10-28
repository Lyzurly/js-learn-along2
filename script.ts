const debug_script: string = "thisErrorIsForFun.js";
const level_canvas: HTMLElement | null =
  document.getElementById("level-canvas");
const input_area: HTMLInputElement = document.getElementById(
  "jsInput"
) as HTMLInputElement;
const button_try: HTMLInputElement = document.getElementById(
  "buttonTry"
) as HTMLInputElement;
const level001_path: string = "level001.html";
let level001_iframe: HTMLIFrameElement;
let level001_window: Window;
let sandbox_params: string;
let correct_origin: string;

checkIfDebug();
function checkIfDebug() {
  console.log("Parent Origin is set to", window.origin);
  fetch(debug_script).then((response) => {
    if (response.statusText === "OK") {
      sandbox_params = "allow-same-origin allow-scripts";
      correct_origin = "http://127.0.0.1:5500";
      createLevel();

      console.log("Origin should be set to: ", correct_origin);
    } else {
      sandbox_params = "allow-scripts";
      if (
        window.origin === "https://hypergamedev.itch.io" ||
        "https://html-classic.itch.zone"
      ) {
        correct_origin = "*";
        createLevel();

        console.log("Origin should be set to: ", correct_origin);
      } else if (window.origin === "https://hypergame.dev") {
        correct_origin = "https://hypergame.dev";
        createLevel();

        console.log("Origin should be set to: ", correct_origin);
      } else {
        console.log(
          "Origin not guessed good! Surprise, it was ",
          window.origin
        );

        console.log("Origin should be set to: ", correct_origin);
      }
    }
  });
}

createInputListener();

function createInputListener() {
  button_try.addEventListener("click", function (event) {
    let input_to_send: string = input_area.value;
    level001_iframe.contentWindow?.postMessage(input_to_send, correct_origin);
  });
}

function createLevel() {
  let new_iframe: HTMLElement = create_element(
    "iframe",
    "level",
    "level001"
  ) as HTMLIFrameElement;

  new_iframe.setAttribute("title", "Level 1");
  new_iframe.setAttribute("src", level001_path);
  new_iframe.setAttribute("sandbox", sandbox_params);

  // Access this in devtools via element.style on the iframe
  new_iframe.style.display = "flex";
  new_iframe.style.width = "100%";
  new_iframe.style.height = "170%";

  level_canvas?.appendChild(new_iframe);
  level001_iframe = new_iframe as HTMLIFrameElement;
}

// TODO: Add an attributes param that take multiple params
function create_element(
  element_type: string,
  class_name: string = "",
  id_name: string = ""
): HTMLElement {
  const element_itself: HTMLElement = document.createElement(element_type);

  if (class_name !== "") {
    if (class_name.includes(" ")) {
      addClassesToElement(element_itself, class_name);
    } else {
      element_itself.classList.add(class_name);
    }
  }

  if (id_name !== "") {
    element_itself.id = id_name;
  }
  return element_itself;
}

function addClassesToElement(element: HTMLElement, string_to_split: string) {
  let class_names = string_to_split.split(" ");
  class_names.forEach((split_class) => {
    element.classList.add(split_class);
  });
}
