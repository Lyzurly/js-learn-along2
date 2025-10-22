console.log("level 1 is ready!");

let input_display_element: HTMLElement | null =
  document.getElementById("level001Text");

window.addEventListener("message", (event) => {
  console.log("Child Origin is set to", window.origin);

  // let result: Function = Function(event.data)
  let result: string = Function(event.data)();

  if (input_display_element) {
    input_display_element.innerHTML = result;
  }
});
