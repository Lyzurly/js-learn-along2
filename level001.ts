const person: HTMLElement = document.getElementById("person") as HTMLElement;
const coins: HTMLCollectionOf<Element> =
  document.getElementsByClassName("coin");

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
  let coin_to_collect: Element = coinCollected() as Element;
  if (coin_to_collect) {
    updateCoin(coin_to_collect);
    coins_val = incrementCoins(coins_val);
    coins_ele.innerHTML = coins_val;
  }
});

function coinCollected(): Element | null {
  let collided_coin: Element | null = null;

  Object.entries(coins).forEach((DOMCoin: [string, Element]) => {
    let hasCollected: boolean = false;
    if (DOMCoin[1].className != "coin hidden") {
      hasCollected = playerGotCoin(DOMCoin[1]);
    }
    if (hasCollected) {
      collided_coin = DOMCoin[1];
    }
  });
  return collided_coin;
}

function playerGotCoin(coin_to_get: Element): boolean {
  let coin_got: boolean = false;
  let rect_person: DOMRect = person.getBoundingClientRect();
  let rect_coin: DOMRect = coin_to_get.getBoundingClientRect();
  if (
    rect_person.x < rect_coin.right &&
    rect_person.y < rect_coin.bottom &&
    rect_person.right > rect_coin.x &&
    rect_person.bottom > rect_coin.y
  ) {
    coin_got = true;
  }
  return coin_got;
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

// TODO: use this to check collision, but do it flash card style :>
// this.position.x < other.position.x + other.width &&
// this.position.x + this.width > other.position.x &&
// this.position.y < other.position.y + other.height &&
// this.position.y + this.height > other.position.y
