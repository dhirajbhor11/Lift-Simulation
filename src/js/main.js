const urlParams = new URLSearchParams(window.location.search);
const TOTALFLOORS = urlParams.get("floor") - 1;
const TOTALLIFTS = urlParams.get("lift");
let FLOORS = null;
let LIFTS = null;
const LiftQueue = [];

class Lifts {
  lifts = [];

  constructor() {
    const height = getBuildingHeight();
    for (let i = 0; i < TOTALLIFTS; i++) {
      this.lifts.push(new Lift(i, height));
    }
    const liftsDiv = document.getElementById("lifts");

    this.lifts.forEach((lift) => {
      liftsDiv.appendChild(lift.getHtml());
    });
  }

  setLifts(lifts) {
    this.lifts = lifts;
  }

  getLiftById(id) {
    return this.lifts.find((lift) => {
      if (lift.floor) return lift.getId() === id;
    });
  }

  getIdleLift(requestedFloor) {
    let idleLift = null;

    idleLift = this.lifts.find((lift) => {
      return requestedFloor.id === lift.floor.id && lift.isIdle;
    });

    if (idleLift) return idleLift;

    return this.lifts.find((lift) => {
      return lift.isIdle;
    });
  }
}
class Floors {
  floors = [];

  constructor() {
    const height = getBuildingHeight();

    for (let i = TOTALFLOORS; i >= 0; i--) {
      this.floors.push(new Floor(i, height));
    }

    const floors = document.getElementById("floors");

    this.floors.forEach((floor) => {
      floors.appendChild(floor.getHtml());
    });
  }

  setfloors(floors) {
    this.floors = floors;
  }

  getFloorByBtnId(id) {
    const floor = this.floors.find((floor) => {
      return floor.getId() === id.substr(0, id.lastIndexOf("-"));
    });

    return floor;
  }

  getAllFloors() {
    return this.floors;
  }
}

function onRequestLift(e) {
  const floorBtnId = this.id || e.target.id;
  const floor = FLOORS.getFloorByBtnId(floorBtnId);
  const floorBtn = floor.getBtnById(floorBtnId);
  floorBtn.pressBtn();
}

class FloorBtn {
  id;
  isPresed;
  HtmlElement;
  floorId;
  floorNo;

  constructor(id, floorBtnElement, isUpBtn) {
    this.HtmlElement = document.createElement("button");
    this.isPresed = false;
    this.id = id + (isUpBtn ? "-up" : "-down");
    this.HtmlElement.id = this.id;
    this.HtmlElement.classList.add("floorBtn");
    this.HtmlElement.innerHTML = isUpBtn ? "&#8593;" : "&#8595;";
    this.HtmlElement.addEventListener("click", onRequestLift);
    floorBtnElement.appendChild(this.HtmlElement);
  }

  toggleBtn(e) {
    this.isPresed = !this.isPresed;
  }

  getBtnById(floorBtnId) {
    const floor = FLOORS.getFloorByBtnId(floorBtnId);
    return floor.getBtnById(floorBtnId);
  }

  pressBtn() {
    if (!this.isPresed) {
      this.isPresed = true;
      this.HtmlElement = document.getElementById(this.id);
      this.HtmlElement.style.backgroundColor = "red";
      LiftQueue.push(this.id);
    }
  }

  getHtmlElement() {
    this.HtmlElement = document.getElementById(this.id);
    return this.HtmlElement;
  }

  releaseBtn() {
    this.HtmlElement = document.getElementById(this.id);
    this.isPresed = false;
    this.HtmlElement.style.background = "buttonface";
  }
}

class FloorUpBtn extends FloorBtn {
  constructor(id, floorBtnElement) {
    super(id, floorBtnElement, true);
  }
}

class FloorDownBtn extends FloorBtn {
  constructor(id, floorBtnElement) {
    super(id, floorBtnElement, false);
  }
}

class Lift {
  id;
  HtmlElement;
  height;
  btnSpace;
  isIdle;
  HtmlDoorElement;
  floor;

  constructor(id, height) {
    this.id = `lift-${id}`;
    this.HtmlElement = document.createElement("div");
    this.HtmlElement.id = `lift-${id}`;
    this.HtmlElement.className = `lift-${id} lift`;
    this.height = height;
    this.HtmlElement.style.height = this.getFloorHeight() + "px";
    this.HtmlElement.appendChild(this.getDoor());
    this.isIdle = true;
    this.floor = FLOORS.getAllFloors()[TOTALFLOORS];
  }

  getFloorHeight() {
    const floor = document.getElementById("floor-0");
    return floor.offsetHeight;
  }

  getHtml() {
    return this.HtmlElement;
  }

  getDoor() {
    this.HtmlDoorElement = document.createElement("div");
    this.HtmlDoorElement.className = "liftDoor";
    return this.HtmlDoorElement;
  }

  moveLift(requestedFloor) {
    this.floor = requestedFloor;
    this.floor.setHasLiftRequested(true);
    const margin = requestedFloor.getHeight();
    this.HtmlElement = document.getElementById(this.id);
    const liftBottom = this.HtmlElement.style.marginBottom;
    let count =
      Math.floor(liftBottom.substring(0, liftBottom.indexOf("px"))) || 0;
    if (this.isIdle) {
      this.isIdle = false;

      if (margin >= count) {
        const upInterval = setInterval(() => {
          if (count <= margin) {
            count++;
            this.HtmlElement.style.marginBottom = count + "px";
          } else {
            clearInterval(upInterval);
            this.toogleDoor();
          }
        }, 20);
      } else if (margin < count) {
        const downInterval = setInterval(() => {
          if (count >= margin) {
            count--;
            this.HtmlElement.style.marginBottom = count + "px";
          } else {
            clearInterval(downInterval);
            this.toogleDoor();
          }
        }, 20);
      }
    }
  }

  toogleDoor() {
    let doorWidth = 100;
    const doorOpenInterval = setInterval(() => {
      if (doorWidth >= 0) {
        --doorWidth;
        this.HtmlDoorElement.style.width = doorWidth + "%";
      } else {
        clearInterval(doorOpenInterval);
        const doorCloseInteval = setInterval(() => {
          if (doorWidth <= 100) {
            ++doorWidth;
            this.HtmlDoorElement.style.width = doorWidth + "%";
          } else {
            clearInterval(doorCloseInteval);
            this.isIdle = true;

            this.floor.releaseBtn();
            this.floor.setHasLiftRequested(false);
          }
        }, 25);
      }
    }, 25);
  }

  getHtmlElement() {
    const element = document.getElementById(this.id);
    return element;
  }

  getId() {
    return this.id;
  }

  getLiftFloor() {
    return this.floor;
  }
}

class Floor {
  id;
  no;
  hasLiftRequested;
  HtmlElement;
  height;
  floorUpBtn;
  floorDownBtn;
  BtnElements;

  constructor(id, height) {
    this.HtmlElement = document.createElement("div");
    this.no = id;
    this.id = `floor-${id}`;
    this.HtmlElement.id = `floor-${id}`;
    this.HtmlElement.appendChild(this.getFloorTitle(id));
    this.HtmlElement.className = `floor-${id} floor`;
    this.height = height;
    this.HtmlElement.style.height = this.height + "px";

    this.createBtnSpace();
    this.addFloorBtns();
  }

  getFloorTitle(id) {
    const title = document.createElement("h3");
    title.className = "floor-title";
    title.innerHTML = `FlOOR-${id == 0 ? "G" : id}`;
    return title;
  }

  getId() {
    return this.id;
  }

  createBtnSpace() {
    this.BtnElements = document.createElement("div");
    this.BtnElements.id = this.id + "btn";
    this.BtnElements.classList.add("navigationBtn");

    this.HtmlElement.appendChild(this.BtnElements);
  }

  getBtnById(id) {
    if (this.no !== TOTALFLOORS && this.floorUpBtn.id === id)
      return this.floorUpBtn;
    else if (this.floorDownBtn.id === id) return this.floorDownBtn;
    return null;
  }

  getHtmlElement() {
    this.HtmlElement = document.getElementById(this.id);
    return this.HtmlElement;
  }

  addFloorBtns() {
    if (this.no !== TOTALFLOORS)
      this.floorUpBtn = new FloorUpBtn(this.id, this.BtnElements);
    if (this.no !== 0)
      this.floorDownBtn = new FloorDownBtn(this.id, this.BtnElements);
  }

  getHtml() {
    return this.HtmlElement;
  }

  getHeight() {
    this.HtmlElement = this.getHtmlElement();
    return this.HtmlElement.offsetHeight * Math.floor(this.id.split("-")[1]);
  }

  releaseBtn() {
    if (this.no !== 0) this.floorDownBtn.releaseBtn();
    if (this.no !== TOTALFLOORS) this.floorUpBtn.releaseBtn();
  }

  setHasLiftRequested(value) {
    this.hasLiftRequested = value;
  }

  getHasLiftRequested() {
    return this.hasLiftRequested;
  }
}

async function create() {
  FLOORS = new Floors();
  LIFTS = new Lifts();
}

async function init() {
  await create();
  run();
}

function getBuildingHeight() {
  const building = document.getElementById("building");
  return Math.round(building.offsetHeight / TOTALFLOORS);
}

function run() {
  setInterval(() => {
    if (LiftQueue.length != 0) {
      const floorId = LiftQueue[0];
      const floor = FLOORS.getFloorByBtnId(floorId);
      const idleLift = LIFTS.getIdleLift(floor);
      if (idleLift) {
        LiftQueue.shift();
        if (!floor.getHasLiftRequested()) {
          idleLift.moveLift(floor);
        }
      }
    }
  }, 0);
}

init();
