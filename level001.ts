const person: HTMLElement = document.getElementById("person") as HTMLElement;
const coins: HTMLCollectionOf<Element> =
  document.getElementsByClassName("coin");
const taco: HTMLElement = document.getElementById("taco") as HTMLElement;

const coins_to_win: string = "3";
const coins_ele: HTMLElement = document.getElementById(
  "goal_val_01"
) as HTMLElement;
let coins_val: string = coins_ele.innerHTML;

console.log("level 1 is ready!");

window.addEventListener("message", (event) => {
  console.log("Child Origin is set to", window.origin);

  let result: string = Function(event.data)();
});

const collisionTick: Event = new Event("collisionTick");
setcollisionTick();
function setcollisionTick() {
  setInterval(() => {
    window.dispatchEvent(collisionTick);
  }, 1);
}

window.addEventListener("collisionTick", (event) => {
  handleCoins();
  handleTacos();
});

function handleCoins() {
  let coin_to_collect: Element = coinCollected() as Element; // assign if coin collected
  if (coin_to_collect) {
    // If a coin IS collected...
    updateCoin(coin_to_collect); // hide it
    coins_val = incrementCoins(coins_val); // inc coin count
    coins_ele.innerHTML = coins_val; // update coin count in html
  }
}

function handleTacos() {
  if (
    playerGotThing(taco) &&
    isString1GreaterThanString2(coins_val, coins_to_win) &&
    !taco.className.includes("hidden")
  ) {
    console.log("Bought tacos!");
    taco.className += "hidden";
  } else {
    console.log("Can't buy tacos");
  }
}

function coinCollected(): Element | null {
  let collided_coin: Element | null = null;

  Object.entries(coins).forEach((DOMCoin: [string, Element]) => {
    let hasCollected: boolean = false;
    if (!DOMCoin[1].className.includes("hidden")) {
      hasCollected = playerGotThing(DOMCoin[1]);
    }
    if (hasCollected) {
      collided_coin = DOMCoin[1];
    }
  });
  return collided_coin;
}

function playerGotThing(thing_to_get: Element): boolean {
  let thing_got: boolean = false;
  let rect_person: DOMRect = person.getBoundingClientRect();
  let rect_thing: DOMRect = thing_to_get.getBoundingClientRect();
  if (
    rect_person.x < rect_thing.right &&
    rect_person.y < rect_thing.bottom &&
    rect_person.right > rect_thing.x &&
    rect_person.bottom > rect_thing.y
  ) {
    thing_got = true;
  }
  return thing_got;
}

function updateCoin(coin_to_update: Element) {
  coin_to_update.className += " hidden";
}

function incrementCoins(string_to_inc: string): string {
  let value: number = parseInt(string_to_inc, 10);
  let new_val: number = +(value += 1);
  let new_val_as_string: string = Math.floor(new_val).toString(10);
  return new_val_as_string;
}

function isString1GreaterThanString2(
  number1: string,
  number2: string
): boolean {
  let number1_int: number = parseInt(number1, 10);
  let number2_int: number = parseInt(number2, 10);
  return number1_int >= number2_int;
}

// TODO: use this to check collision, but do it flash card style :>
// this.position.x < other.position.x + other.width &&
// this.position.x + this.width > other.position.x &&
// this.position.y < other.position.y + other.height &&
// this.position.y + this.height > other.position.y
