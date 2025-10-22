console.log("level 1 is ready!");

window.addEventListener("message", (event) => {
  console.log("Child Origin is set to", window.origin);

  // let result: Function = Function(event.data)
  let result: string = Function(event.data)();
});
