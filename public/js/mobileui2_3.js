//Constant Variables
const trigger = document.getElementById("trigger");
const handle = document.getElementById("handle");
const fire = document.getElementById("fire");
// const counterDisplay = document.getElementById("counter");
const resetBtn = document.getElementById("resetBtn");
const safetyBtn = document.getElementById("safetyBtn");
const roundsLeft = document.getElementById("roundsLeft");
const barrelCover = document.getElementById('barrelCover');
// const distValue = document.getElementById('distValue');
const lastRoundCatch = document.getElementById('lastRoundCatch');
const jamFixBtn = document.getElementById("jamFixBtn");
const accYDisplay = document.getElementById("accY"); // Motion debug display

const guncock = new Audio('gun_cock.mp3');
const ia = new Audio('empty_gun.mp3');
//Functions
function guncockSound() {
  guncock.currentTime = 0; // rewind to start if needed
  guncock.play();
}
function iaSound() {
  ia.currentTime = 0; // rewind to start if needed
  ia.play();
}

let roundsCount = 30;
function updateRounds() {
  if (roundsCount > 0) {
    roundsCount--;
    roundsLeft.textContent = `Rounds Left: ${roundsCount}`;
  } 
  else {
    iaSound();
    roundsLeft.textContent = 'Rounds Left: 0 (Disabled)';
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
    speedDisplay.textContent = `${sliderID.charAt(0).toUpperCase() + sliderID.slice(1)} Speed: ${speed}`;

    lastTime = now;
    lastValue = currentValue;
  });
}

function resetSlider(slider) {
  // Optional lock if it's handle at min and not caught before
  if (slider.id === 'handle' && lastCatch && slider.value === slider.min) {
    slider.value = slider.min; // keep it locked here
    handle.disabled = true;
    return; // stop here if we're locking at min
  }
  else{
    slider.value = slider.max;
  }
}

function updateBoltPosition() {
  const dist = parseInt(handle.value);
  barrelCover.style.left = `${dist}px`;
  // distValue.textContent = `${dist}px`;
}

//Fullscreen
function toggleFullscreen() {
  const elem = document.documentElement;
  const btn = document.getElementById("fullscreenBtn");

  if (!document.fullscreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement) {
    // Enter fullscreen
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem.webkitRequestFullscreen) {
      elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) {
      elem.msRequestFullscreen();
    }
    btn.textContent = "Exit Fullscreen";
  } 
  else {
    // Exit fullscreen
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    }
    btn.textContent = "Enter Fullscreen";
  }
}

// Only add listener when jammed
function handleMotion(event) {
  const acc = event.accelerationIncludingGravity;
  if (!acc) return;
  const y = acc.y.toFixed(2);
  accYDisplay.textContent = y; // Display live value

  if (isJammed && acc.y > 15) {
    clearJam();
  }
}

function clearJam() {
  isJammed = false;
  trigger.disabled = false;
  trigger.value = trigger.max;
  handle.max = 0;
  gear.style.display = "none";
  window.removeEventListener("devicemotion", handleMotion);
}

function requestMotionPermission(whenGrantedCallback) {
  if (typeof DeviceMotionEvent?.requestPermission === 'function') {
    DeviceMotionEvent.requestPermission()
      .then(state => {
        if (state === 'granted') {
          if (typeof whenGrantedCallback === 'function') {
            whenGrantedCallback();
          }
        } else {
          console.warn("Motion permission denied.");
        }
      })
      .catch(console.error);
  } else {
    // Android / other browsers
    if (typeof whenGrantedCallback === 'function') {
      whenGrantedCallback();
    }
  }
}

// Safety button
let safetyOn = true;
let handleUnlocked = false;

safetyBtn.addEventListener("click", () => {
  safetyOn = !safetyOn; // flip the state
  safetyBtn.textContent = safetyOn ? "Safety On" : "Safety Off";
  safetyBtn.style.backgroundColor = safetyOn ? 'green' : 'red';
  trigger.disabled = safetyOn || !handleUnlocked;
});

// Initially disable trigger
trigger.disabled = true;
handle.addEventListener("input", () => {
    if (handle.value === handle.min){
        guncockSound();
    }
    if ((!handleUnlocked && parseInt(handle.value) === parseInt(handle.min)) && !safetyOn) {
        //If handle is pulled back
        trigger.disabled = false;
        handleUnlocked = true; // prevent re-enabling or repeating logic
    }
});

//Firing Rounds
let hasFired = false; // To avoid counting the same hold multiple times
let fireCount = 0;
let isJammed = false;
trigger.disabled = true;
handle.disabled = true;

trigger.addEventListener("input", () => {
  // Don't fire if jammed
  if (isJammed) {
    fire.style.display = "none";
    return;
  }

  if (!safetyOn && parseInt(trigger.value) === parseInt(trigger.min)) {
    fire.style.display = "block";
    if (!hasFired) {
      if (Math.random() < 0.1) {
        iaSound();
        if (Math.random() < 0.5){
            isJammed = true;
            fire.style.display = "none";
            gear.style.display = "block";
            trigger.disabled = true;
            requestMotionPermission(() => {
            window.addEventListener("devicemotion", handleMotion);
          });
        }
        else{
            isJammed = true;
            jamFixBtn.style.display = "block";
            gear.style.display = "block";
            fire.style.display = "none";
            trigger.disabled = true;
            handle.value = -375;
            handle.max = -375;
            updateBoltPosition();
            return;
        }
        return;
      }
      fireCount++;
      updateRounds();
      hasFired = true;
      if (roundsCount <= 0) {
        trigger.disabled = true;
        roundsLeft.textContent = `Rounds Left: 0 (Disabled)`;
        barrelCover.style.left = "0px";
        handle.value = handle.min;
        updateBoltPosition();
        handle.disabled = true;
      }
    }
  } else {
    fire.style.display = "none";
    hasFired = false;
  }
});

jamFixBtn.addEventListener("click", () => {
  isJammed = false;
  jamFixBtn.style.display = "none";
  trigger.value = trigger.max;
  handle.max = 0;
  updateRounds();
  gear.style.display = "none";
});

//Load New Magazine aka Reset button
resetBtn.addEventListener("click", () => {
  roundsCount = 30;
  fireCount = 0;
  // counterDisplay.textContent = `Fires: 0`;
  roundsLeft.textContent = `Rounds Left: 30`;
  resetSlider(trigger);
  handleUnlocked = false;
  trigger.disabled = true;
  handle.disabled = false;
  requestMotionPermission(); // pre-authorize if not already
});

//Last Round Catch
let lastCatch = false;                            
lastRoundCatch.addEventListener('click', () => {
  lastCatch = !lastCatch; // flip the boolean
  lastRoundCatch.style.backgroundColor = lastCatch ? 'green' : 'red';
  if (!lastCatch) {
  handle.value = handle.max;
  updateBoltPosition();
  }
  handle.disabled = lastCatch && handle.value === handle.min;
  trigger.disabled = lastCatch;
});

trigger.addEventListener("mouseup", () => resetSlider(trigger)); // for mouse
trigger.addEventListener("touchend", () => resetSlider(trigger)); // for mobile

handle.addEventListener("mouseup", () => resetSlider(handle)); // for mouse
handle.addEventListener("touchend", () => resetSlider(handle)); // for mobile

handle.addEventListener("mouseup", () => updateBoltPosition()); // for mouse
handle.addEventListener("touchend", () => updateBoltPosition()); // for mobile

setupSliderSpeed("trigger", "speed");
setupSliderSpeed("handle", "speedHandle");

handle.addEventListener('input', updateBoltPosition);
