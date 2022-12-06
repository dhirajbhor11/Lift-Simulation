//const var
const maxFloor = 10;
const maxLifts = 7;

async function putInputValues() {
  try {
    const formInputFields = await document.forms[
      "inputForm"
    ].getElementsByTagName("input");

    [...formInputFields].forEach((inputField) => {
      console.log(inputField.value);
      if (inputField.value === "") {
        const storageData = getData(inputField.name);
        if (storageData !== null) {
          inputField.value = storageData;
          if (!isValid(inputField.name, inputField.value)) {
            showErrorMessage(inputField.name);
          } else {
            showErrorMessage(inputField.name, true);
          }
        }
      }
    });
  } catch (error) {
    console.log("Error in putInputValues : ", error);
  }
}

function getData(name) {
  return localStorage.getItem(name);
}

// adding events to inputs.
async function addEvents() {
  try {
    // getting all input field from form.
    const formInputFields = await document.forms[
      "inputForm"
    ].getElementsByTagName("input");

    // adding onchange event to input fileds.
    [...formInputFields].forEach((inputField) => {
      inputField.addEventListener("change", onInputChange);
    });

    //add event to submit btn
    document.getElementById("startBtn").addEventListener("click", onStart);
  } catch (error) {
    console.log("Error while adding events : ", error);
  }
}

function onStart(e) {
  e.preventDefault();
  if (isValid("floor", getData("floor")) && isValid("lift", getData("lift"))) {
    window.location.href = `./simulator.html?floor=${getData(
      "floor"
    )}&lift=${getData("lift")}`;
  }
}

// onchange event for inputfields store data in storage.
function onInputChange(e) {
  const name = e.target.name;
  const value = e.target.value;

  if (isValid(name, value)) {
    showErrorMessage(name, true);
  } else {
    showErrorMessage(name);
  }
  storeData(name, value);
}

function isValid(name, value) {
  if (name === "floor") {
    return value >= 1 && value <= maxFloor;
  } else if (name === "lift") {
    return value >= 1 && value <= maxLifts;
  }
}

function storeData(name, value) {
  localStorage.setItem(name, value);
}

function showErrorMessage(name, isClearMessage = false) {
  if (name === "floor") {
    if (isClearMessage) {
      document.getElementById("floorErrorMessage").innerHTML = "";
    } else {
      const message = `Please Enter Number Between 1 And ${maxFloor}.`;
      document.getElementById("floorErrorMessage").innerHTML = message;
    }
  } else if (name === "lift") {
    console.log(name);
    if (isClearMessage) {
      document.getElementById("liftErrorMessage").innerHTML = "";
    } else {
      const message = `Please Enter Number Between 1 And ${maxLifts}.`;
      document.getElementById("liftErrorMessage").innerHTML = message;
    }
  }
}

async function init() {
  await addEvents();
  await putInputValues();
}

init();
