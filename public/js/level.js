let totalShots = 0;
let shotsHit = 0;

function recordShot() {
    totalShots++;
}

function recordShotHit() {
    shotsHit++;
}

function resetStats() {
    const accuracyContainer = document.querySelector(".accuracy-container");
    if (accuracyContainer) {
        accuracyContainer.classList.remove("hide");
    }
    totalShots = 0;
    shotsHit = 0;
}

function calcAccuracy() {
    if (totalShots === 0) return "0%";
    return Math.round((shotsHit / totalShots) * 100) + "%";
}

function updateAccuracy() {
    const currentPercent = document.getElementById("accuracyValue");
    const currentCount = document.getElementById("accuracyCount");
    currentCount.textContent = `${shotsHit}/${totalShots}`;
    const percentage = calcAccuracy();
    
    currentPercent.textContent = `${percentage}`;
}

function clearElements() {
    // Remove existing targets,red dots, bullet shots
    document.querySelectorAll(".hit-dot").forEach(dot => dot.remove());
    document.querySelectorAll(".target-container").forEach(t => t.remove());
    document.querySelectorAll(".bulletshot").forEach(shot => shot.remove());
}


function createTarget(width, height, classname = "") {
    // Find backdrop element
    const backdrop = document.getElementById("backdrop");

    const x = (Math.random() * (0.9 - 0.1) + 0.1) * (window.innerWidth - 30);
    const y = (Math.random() * (0.58 - 0.5) + 0.5) * (window.innerHeight);

    // Log coordinates to console
    console.log(`Target appeared at: x = ${Math.round(x)}, y = ${Math.round(y)}`);

    // Creating target
    const targetContainer = document.createElement("div");
    targetContainer.className = "target-container " + classname;
    const target = document.createElement("img");
    if (isDarkMode()) {
        const blinker = document.createElement("div");
        blinker.className = "blinker";
        targetContainer.appendChild(blinker);
    }

    targetContainer.appendChild(target);
    target.src = "/public/assets/target-brown.PNG";
    target.id = "target"
    target.className = "target toggle";
    targetContainer.style.left = x + 'px';
    targetContainer.style.top = y + 'px';
    target.style.width = width + 'px';
    target.style.height = height + 'px';

    backdrop.appendChild(targetContainer);
}

function easyMode() {
    // Static large targets, 4s
    setInterval(() => {
        clearElements();
        createTarget(40, 55);
    }, 4000);
}

function midMode() {
    // Slow moving targets, 8s
    setInterval(() => {
        clearElements();
        createTarget(30, 35, "swaying-slow");
    }, 8000);
}

function marksmenMode() {
    // Fast moving targets, 6s
    setInterval(() => {
        clearElements();
        createTarget(30, 35, "swaying-fast");
    }, 6000);
}

function playLevel(mode) {
    if (mode === "easy") {
        easyMode();
    } else if (mode === "mid") {
        midMode();
    } else if (mode === "marksmen") {
        marksmenMode();
    } else {
        spawnScreenButtons();
    }
}

function toggleNight() {
    const current = toggle.getAttribute("data-dark");
    if (!isDarkMode()) {
        document.body.classList.add("dark");
        toggle.setAttribute("data-dark", "true");
    } else {
        document.body.classList.remove("dark");
        toggle.setAttribute("data-dark", "false");
    }
}

const toggleButton = document.getElementById("toggle");
if (toggleButton) {
    toggleButton.addEventListener("click", toggleNight);
}
function startLevel(mode) {
    resetStats();
    updateAccuracy();
    playLevel(mode);
}
function isDarkMode() {
    const toggle = document.getElementById("toggle");
    return toggle && toggle.getAttribute("data-dark") === "true";
}

function checkHit(element,x,y){
    const rect = element.getBoundingClientRect();
    const elementLeft = rect.left;
    const elementRight = rect.right;
    const elementTop = rect.top;
    const elementBottom = rect.bottom;
    return x >= elementLeft && x <= elementRight && y >= elementTop && y <= elementBottom;
}
const difficultyButtons = document.getElementsByClassName("difficulty")
Array.from(difficultyButtons).forEach(button => {
    button.addEventListener("click", () => {
        const mode = button.id;
        Array.from(difficultyButtons).forEach(btn => btn.classList.remove("selected-difficulty"));
        button.classList.add("selected-difficulty");
        startLevel(mode);
    });
});
