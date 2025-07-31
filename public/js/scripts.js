//Constant Variables
const trigger = document.getElementById("trigger");
const handle = document.getElementById("handle");
const fire = document.getElementById("fire");
const counterDisplay = document.getElementById("counter");
const resetBtn = document.getElementById("resetBtn");
const safetyBtn = document.getElementById("safetyBtn");
const roundsBtn = document.getElementById("roundsBtn");

//Functions
let roundsCount = 30;

function updateRounds() {
  if (roundsCount > 0) {
    roundsCount--;
    roundsBtn.textContent = `Rounds Left: ${roundsCount}`;
  } else {
    roundsBtn.textContent = `Rounds Left: ${roundsCount}`;
  }
}

function setupSliderSpeed(sliderID, speedID) {
  const speedDisplay = document.getElementById(speedID);
  const slider = document.getElementById(sliderID);
  let lastTime = Date.now();
  let lastValue = slider.value;

  // Speed detection on input
  slider.addEventListener("input", () => {
    const now = Date.now();
    const currentValue = slider.value;

    const timeDiff = (now - lastTime) / 1000; // in seconds
    const valueDiff = -(currentValue - lastValue);

    const speed = timeDiff > 0 ? (valueDiff / timeDiff).toFixed(2) : 0;
    speedDisplay.textContent = `Speed: ${speed}`;

    lastTime = now;
    lastValue = currentValue;
  });
}

// Reset trigger to right on release
function resetSlider(slider) {
  slider.value = slider.max;
}

// Safety button
let safetyOn = true;
let handleUnlocked = false;

safetyBtn.addEventListener("click", () => {
  if (safetyOn === true) {
    safetyBtn.textContent = "Safety Off";
    safetyOn = false;
    if (handleUnlocked === true){
      trigger.disabled = false;
    }
  } 
  else {
    safetyBtn.textContent = "Safety On";
    safetyOn = true;
    trigger.disabled = true;
  }
});

// Initially disable trigger
trigger.disabled = true;
handle.addEventListener("input", () => {
  if ((!handleUnlocked && parseInt(handle.value) === parseInt(handle.min)) && !safetyOn) {
    //If handle is pulled back
    trigger.disabled = false;
    handleUnlocked = true; // prevent re-enabling or repeating logic
    console.log("Trigger enabled after handle reached min.");
  }
  else if (handleUnlocked === true && parseInt(handle.value) === parseInt(handle.min)) {
    roundsCount --;
  }
});

//Firing Rounds
let hasFired = false; // To avoid counting the same hold multiple times
let fireCount = 0;
trigger.addEventListener("input", () => {
  if (!safetyOn && parseInt(trigger.value) === parseInt(trigger.min)) {
    fire.style.display = "block";
    if (!hasFired) {
      fireCount++;
      updateRounds();
      counterDisplay.textContent = `Fires: ${fireCount}`;
      hasFired = true;
      if (fireCount >= 30) {
        trigger.disabled = true;
        counterDisplay.textContent = `Fires: ${fireCount} (Disabled)`;
      }
    }
  } 
  else {
    fire.style.display = "none";
    hasFired = false;
  }
});

//Load New Magazine aka Reset button
resetBtn.addEventListener("click", () => {
  roundsCount = 30;
  fireCount = 0;
  counterDisplay.textContent = `Fires: 0`;
  roundsBtn.textContent = `Rounds Left: 30`;
  resetSlider(trigger);
  handleUnlocked = false;
  trigger.disabled = true;
});

trigger.addEventListener("mouseup", () => resetSlider(trigger)); // for mouse
trigger.addEventListener("touchend", () => resetSlider(trigger)); // for mobile

handle.addEventListener("mouseup", () => resetSlider(handle)); // for mouse
handle.addEventListener("touchend", () => resetSlider(handle)); // for mobile

setupSliderSpeed("trigger", "speed");
setupSliderSpeed("handle", "speedHandle");
