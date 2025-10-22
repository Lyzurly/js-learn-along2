"use strict";

// TODO: Game over state. Can't afford state. More price clarity. Balancing. Spritesheets. Number texts resize based on width. Juicy spend/earn/profit-vs-revenue tracking. Color-coded auras on workers that match their mood. More mobile friendly.

// ATTENTION: a closure can mean that an arrow function is remembering the surrounding scope where it was created. And you should remember that

const workers_canvas = document.querySelector(".workers-canvas");

let worker_idno_previous = -1;
let workers = [];
const id_prefix_worker = "worker_";
const class_prefix_ability = "ability-";
const class_prefix_stat = "stat-";

const button_hire_employee = document.querySelector("#hire-employee");
const button_hire_intern = document.querySelector("#hire-intern");
const button_hire_test = document.querySelector("#hire-test");

const eleRevenue = document.querySelector("#revenue");
let valueRevenue = 3000;
let factorRevenue = 10000;

const eleCost = document.querySelector(".cost");
let valueCost = 0;

// const eleCost_employee = document.querySelector("#employee-cost");
let priceEmployee = 3000;

const money_formatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

const default_max_stat = 10;
const default_min_stat = 0;
const base_inc_stat = 5;
const base_happiness = 50;

const default_decrement_amount = 1;
const default_increment_amount = 1;
const default_tick_interval = 2;
const default_tick_counter = default_tick_interval;
const default_income_tolerance = 5;

const SPRITESHEET_PATH = "WorkerSpriteSheet.png";
const SPRITE_CANVAS_SIZE = 128;

const animationFramePositions = [];
const animationData = [
  {
    name: "happy",
    frames: 24,
  },
  {
    name: "sad",
    frames: 48,
  },
  {
    name: "angry",
    frames: 24,
  },
];

animationData.forEach((rowData, index) => {
  let framesInRow = {
    positionsInRow: [],
  };

  for (let cell = 0; cell < rowData.frames; cell++) {
    // these vars represent the top left corner of the desired sprite
    let columnPosition = SPRITE_CANVAS_SIZE * cell;
    let rowPosition = SPRITE_CANVAS_SIZE * index;
    framesInRow.positionsInRow.push({ x: columnPosition, y: rowPosition });
    animationFramePositions[rowData.name] = framesInRow;
  }
});

// === Global Functions === //
startingMoney();
function startingMoney() {
  eleRevenue.innerHTML = money_formatter.format(valueRevenue);
  // eleCost_employee.innerHTML = priceEmployee;
}

const tick = new Event("tick");
setGlobalInterval();
function setGlobalInterval() {
  setInterval(() => {
    window.dispatchEvent(tick);
  }, 500);
}

const animationTick = new Event("animationTick");
setAnimationTick();
function setAnimationTick() {
  setInterval(() => {
    window.dispatchEvent(animationTick);
  }, 1);
}

// === Worker Classes === //

// ABSTRACT CLASS //
class Worker {
  constructor(worker_id) {
    this.worker_container = create_element(
      "div",
      "worker-container",
      worker_id
    );

    this.workerState = "happy";

    this.createWorkerSprite();

    this.currentFrame = 0;
    this.frameDelay = 15;
    this.animateWorkerSprite();

    this.createTickListeners();
  }

  createWorkerSprite() {
    this.sprite_container = create_element("div", "sprite-container");

    this.sprite_canvas = create_element("canvas", "sprite-canvas");
    this.sprite_canvas.width = SPRITE_CANVAS_SIZE;
    this.sprite_canvas.height = SPRITE_CANVAS_SIZE;
    this.sprite_context = this.sprite_canvas.getContext("2d");

    this.workerSpritesheet = new Image();
    this.workerSpritesheet.src = SPRITESHEET_PATH;

    this.sprite_container.appendChild(this.sprite_canvas);
    this.worker_container.appendChild(this.sprite_container);
  }

  animateWorkerSprite() {
    // console.log("; Current state is", this.workerState);

    // TODO: Reconsider some of the setup here on state change,
    // so it actually WAITS to change the animation
    // at the end of the loop!
    this.workerStateChange = false;
    this.currentWorkerState = null;
    if (
      this.currentWorkerState &&
      this.currentWorkerState != this.workerState
    ) {
      this.workerStateChange = true;
    } else {
      this.workerStateChange = false;
    }

    // frame increments every call
    this.rowLength =
      animationFramePositions[this.workerState].positionsInRow.length;
    this.frame =
      Math.floor(this.currentFrame / this.frameDelay) % this.rowLength;
    if (this.frame == this.rowLength - 1) {
      if (this.canLoopAnimation(this.workerStateChange)) {
        this.currentFrame = 0;
      }
    }

    this.frameOriginX = SPRITE_CANVAS_SIZE * this.frame;
    this.frameOriginY =
      animationFramePositions[this.workerState].positionsInRow[this.frame].y;

    if (this.currentFrame > 1152) {
      this.currentFrame = 0;
    }
    this.sprite_context.drawImage(
      this.workerSpritesheet,
      this.frameOriginX,
      this.frameOriginY,
      SPRITE_CANVAS_SIZE,
      SPRITE_CANVAS_SIZE,
      0,
      0,
      SPRITE_CANVAS_SIZE,
      SPRITE_CANVAS_SIZE
    );

    this.currentFrame++;
  }

  setWorkerState(state) {
    this.workerState = state;
  }

  canLoopAnimation(onStateChange) {
    return onStateChange || this.currentFrame > 1000;
  }

  createWorkerInterface(stats) {
    this.worker_interface = create_element("div", "worker-interface");
    Object.entries(stats).forEach((stat) => {
      this.worker_interface.appendChild(stat[1].stat_interface);
    });
    this.worker_container.appendChild(this.worker_interface);
    this.addWorkerToDOM(this.worker_container);
  }

  addWorkerToDOM(worker_to_add) {
    workers_canvas.appendChild(worker_to_add);
    requestAnimationFrame(() => {
      worker_to_add.classList.add("fade-in");
    });
  }

  createTickListeners() {
    this.workerTickListener = () => {
      this.assessWellbeingOnTick();

      Object.entries(this.stats).forEach((stat) => {
        // This decreases, but another one could increase
        stat[1].updateStatIntervalOnTick(decreaseStat, stat[1]);

        // see?
        // stat[1].updateIntervalOnTick(increaseStat, stat[1]);
      });
    };

    this.animationTickListener = () => {
      this.animateWorkerSprite();
    };

    window.addEventListener("animationTick", this.animationTickListener);
    window.addEventListener("tick", this.workerTickListener);
  }

  assessWellbeingOnTick() {
    this.latestValue_income = 0;
    if (this.stats.hasOwnProperty("income")) {
      this.latestValue_income = this.stats.income.stat_value.innerHTML;
    }

    this.latestValue_happiness = 0;
    if (this.stats.hasOwnProperty("happiness")) {
      this.latestValue_happiness = this.stats.happiness.stat_value.innerHTML;
    }

    valueRevenue =
      valueRevenue +
      Number(Math.floor(this.latestValue_income / factorRevenue)) +
      Number(this.latestValue_happiness);

    this.newRevenue = money_formatter.format(valueRevenue);

    eleRevenue.innerHTML = this.newRevenue;

    if (this.latestValue_happiness <= 0 && this.latestValue_income <= 0) {
      // Worker quits
      removeWorker(this);

      // } else if (this.latestValue_income < priceEmployee){
      //   // Worker is sad
      //   this.workerState = "sad"

      // } else {
      //   this.workerState = "happy"
    }
  }
}

class Employee extends Worker {
  constructor(worker_id) {
    super(worker_id);
    this.stats = {
      income: new Income(this.worker_container, this),
      happiness: new Happiness(this.worker_container, this),
    };

    this.createWorkerInterface(this.stats);
  }
}

class Intern extends Worker {
  constructor(worker_id) {
    super(worker_id);
    this.stats = {
      duration: new Duration(this.worker_container, this),
      happiness: new Happiness(this.worker_container, this),
    };

    this.createWorkerInterface(this.stats);
  }
}

class TestWorker extends Worker {
  constructor(worker_id) {
    super(worker_id);
    this.stats = { teststat: new TestStat(this.worker_container, this) };

    this.createWorkerInterface(this.stats);
  }
}

// === Hiring Buttons === //

button_hire_employee.addEventListener("click", function () {
  if (canAfford(priceEmployee)) {
    workers.push(new Employee(createWorkerID()));
    spendMoney(priceEmployee);

    requestAnimationFrame(() => {
      updateCanvasColumns();
    });
  }
});
button_hire_employee.addEventListener("mouseenter", function () {
  onButtonHover(priceEmployee);
});
button_hire_employee.addEventListener("mouseleave", function () {
  onButtonUnHover(priceEmployee);
});

// button_hire_intern.addEventListener("click", function (event) {
//   workers.push(new Intern(createWorkerID()));
// });

// button_hire_test.addEventListener("click", function (event) {
//   workers.push(new TestWorker(createWorkerID()));
// });

// === Stat Classes === //

// ABSTRACT CLASS //
class Stat {
  constructor(
    worker_container,
    worker_obj,
    max_stat = default_max_stat,
    decrement_amount = default_decrement_amount,
    increment_amount = default_increment_amount,
    price = null,
    tick_interval = default_tick_interval
  ) {
    this.worker_container = worker_container;
    this.worker_obj = worker_obj;
    this.stat_interface = create_element("div", "stat-interface");

    this.max_stat_og = max_stat;
    this.max_stat = this.max_stat_og;

    this.decrement_amount_og = decrement_amount;
    this.decrement_amount = this.decrement_amount_og;

    this.increment_amount_og = increment_amount;
    this.increment_amount = this.increment_amount_og;

    this.price_og = price;
    this.price = this.price_og;

    this.tick_interval_og = tick_interval;
    this.tick_interval = this.tick_interval_og;
    this.tick_interval_fast = Math.floor(this.tick_interval / 5);

    this.tick_counter = this.tick_interval;
  }

  // Calls fn_onInterval on interval, with the parameter fn_onIntervalParam1
  updateStatIntervalOnTick(fn_onInterval, fn_onIntervalParam1 = null) {
    if (!workers.includes(this.worker_obj)) return;

    this.adjustIntervalAndState(this.constructor.name);

    this.tick_counter--;
    if (this.tick_counter <= 0) {
      this.tick_counter = this.tick_interval;
      fn_onInterval(fn_onIntervalParam1);
      // this.monitorOnInterval(this.constructor.name);
    }
  }

  adjustIntervalAndState(stat_name) {
    // Speed up the decrease of happiness
    // Adjust worker state based on that
    switch (stat_name) {
      case "Happiness":
        this.income_value = fetchClassEleInID(
          this.worker_container.id,
          "stat-Income"
        ).innerHTML;

        //#region Sad consequence, or undo sad consequence
        if (this.income_value < Math.floor(priceEmployee / 2)) {
          // Worker sad
          this.worker_obj.setWorkerState("sad");

          this.tick_interval = this.tick_interval_fast;
          if (this.tick_counter > this.tick_interval) {
            this.tick_counter = this.tick_interval;
          }
        } else {
          // Worker happy
          this.worker_obj.setWorkerState("happy");
          // console.log("Worker state set to", this.workerState);
          this.tick_interval = this.tick_interval_og;
        }
        //#endregion

        //#region Angry consequence, or undo angry consequence
        if (this.income_value < Math.floor(priceEmployee / 3)) {
          // Worker angry
          this.worker_obj.setWorkerState("angry");
          // console.log("Worker state set to", this.workerState);
          this.decrement_amount = Math.floor(this.decrement_amount * 2);
        } else {
          this.decrement_amount = this.decrement_amount_og;
        }
        //#endregion

        break;
      default:
      //
    }
  }

  create_stat(stat_name, ability_name = null) {
    this.stat_container = create_element("div", "stat-container");

    this.stat_wrapper = create_element("div", "stat-wrapper");
    this.stat_wrapper.innerHTML = stat_name;

    this.stat_specific_class = class_prefix_stat + stat_name;
    this.stat_value = create_element(
      "div",
      "stat-value " + this.stat_specific_class
    );

    switch (stat_name) {
      case "Income":
        this.stat_value.innerHTML = priceEmployee;
        break;
      case "Happiness":
        this.stat_value.innerHTML = base_happiness;
        break;
      default:
        this.stat_value.innerHTML = base_inc_stat;
    }

    this.stat_wrapper.appendChild(this.stat_value);
    this.stat_container.appendChild(this.stat_wrapper);

    if (ability_name) {
      this.ability_specific_class = class_prefix_ability + stat_name;
      this.create_ability(ability_name, this.ability_specific_class);
    }

    this.stat_interface.appendChild(this.stat_container);
    this.worker_container.appendChild(this.stat_interface);

    return this.stat_value;
  }

  create_ability(ability_name, ability_specific_class) {
    this.abilities_container = create_element("div", "abilities-container");

    this.new_button = create_element("button", ability_specific_class);
    this.new_button_span = create_element("span", "button-text");
    this.new_button_span.innerHTML = ability_name;

    this.new_button.appendChild(this.new_button_span);

    this.new_button.addEventListener("click", () => {
      increaseStat(this);
    });

    this.new_button.addEventListener("mouseenter", () => {
      if (this.price) {
        onButtonHover(this.price);
      }
    });

    this.new_button.addEventListener("mouseleave", () => {
      if (this.price) {
        onButtonUnHover();
      }
    });

    this.abilities_container.appendChild(this.new_button);

    this.stat_interface.appendChild(this.abilities_container);
  }
}

class Duration extends Stat {
  constructor(worker_container, worker_obj) {
    super(worker_container, worker_obj);
    this.stat_value = this.create_stat(this.constructor.name);
  }
}

class Income extends Stat {
  constructor(worker_container, worker_obj) {
    super(
      worker_container,
      worker_obj,
      null,
      100,
      priceEmployee / 2,
      priceEmployee / 2,
      default_tick_interval
    );
    this.ability_name = "Pay";
    this.stat_value = this.create_stat(
      this.constructor.name,
      this.ability_name
    );
  }
}

class Happiness extends Stat {
  constructor(worker_container, worker_obj) {
    super(
      worker_container,
      worker_obj,
      100,
      default_decrement_amount,
      default_increment_amount,
      null,
      5
    );
    this.ability_name = "Praise";
    this.stat_value = this.create_stat(
      this.constructor.name,
      this.ability_name
    );
  }
}

class TestStat extends Stat {
  constructor(worker_container, worker_obj) {
    super(worker_container, worker_obj);
    this.ability_name = "Test";
    this.stat_value = this.create_stat(
      this.constructor.name,
      this.ability_name
    );
  }
}

// === UI Functions === //

function onButtonHover(button_cost) {
  eleCost.innerHTML = "-" + money_formatter.format(button_cost);
  eleCost.classList.remove("hide");
}

function onButtonUnHover() {
  eleCost.classList.add("hide");
}

function updateCanvasColumns() {
  if (workers.length > 1) {
    workers_canvas.style.gridTemplateColumns = "repeat(2, 1fr)";
  } else {
    workers_canvas.style.gridTemplateColumns = "repeat(1, 1fr)";
  }
}

// === Worker Management Functions === //

function removeWorker(worker_to_remove) {
  worker_to_remove.worker_container.classList.add("fade-out");
  setTimeout(() => {
    workers = workers.filter(
      (worker_in_array) => worker_in_array !== worker_to_remove
    );

    window.removeEventListener(
      "animationTick",
      worker_to_remove.animationTickListener
    );
    window.removeEventListener("tick", worker_to_remove.workerTickListener);

    worker_to_remove.worker_container.remove();
    worker_to_remove = null;

    updateCanvasColumns();
  }, 400);
}

function createWorkerID() {
  let worker_idno_current = ++worker_idno_previous;
  worker_idno_previous = worker_idno_current;

  return id_prefix_worker + worker_idno_current.toString();
}

function increaseStat(stat_to_increase) {
  const stat_value = stat_to_increase.stat_value;
  const stat_inc_amt = stat_to_increase.increment_amount;
  let value = Math.floor(stat_value.innerHTML);
  const price = stat_to_increase.price;

  if (price) {
    if (canAfford(price)) {
      spendMoney(price);
    } else {
      return;
    }
  }
  if (value !== stat_to_increase.max_stat) {
    if (statIsInRange(stat_to_increase, value)) {
      value += stat_inc_amt;
    }
  }
  stat_value.innerHTML = value;
}

function decreaseStat(stat_to_decrease) {
  const stat_value = stat_to_decrease.stat_value;
  const stat_dec_amt = stat_to_decrease.decrement_amount;
  let value = Math.floor(stat_value.innerHTML);

  if (stat_value.innerHTML == 0) {
    return;
  }
  if (stat_value.innerHTML < stat_dec_amt) {
    value = 0;
  } else {
    if (statIsInRange(stat_to_decrease, value)) {
      value -= stat_dec_amt;
    }
  }
  stat_value.innerHTML = value;
}

// === Helper Functions === //

function canAfford(cost_to_afford) {
  return cost_to_afford <= valueRevenue;
}

function spendMoney(cost_to_spend) {
  valueRevenue -= cost_to_spend;
  eleRevenue.innerHTML = money_formatter.format(valueRevenue);
}

function fetchClassEleInID(ele1_id, ele2_class) {
  return document.getElementById(ele1_id).getElementsByClassName(ele2_class)[0];
}

function statIsInRange(stat_to_check, value) {
  //return if value between min and max
  if (stat_to_check.max_stat) {
    return Boolean(
      value <= stat_to_check.max_stat && value >= default_min_stat
    );
  } else {
    return Boolean(value > default_min_stat);
  }
}

function create_element(element_type, class_name = null, id_name = null) {
  const element_itself = document.createElement(element_type);

  if (class_name) {
    if (class_name.includes(" ")) {
      addClassesToElement(element_itself, class_name);
    } else {
      element_itself.classList.add(class_name);
    }
  }

  if (id_name) {
    element_itself.id = id_name;
  }
  return element_itself;
}

function addClassesToElement(element, string_to_split) {
  let class_names = string_to_split.split(" ");
  class_names.forEach((split_class) => {
    element.classList.add(split_class);
  });
}
