const accuracies = {
    1: {
        total: 0,
        hits: 0
    },
    2: {
        total: 0,
        hits: 0
    },
    3: {
        total: 0,
        hits: 0
    },
    4: {
        total: 0,
        hits: 0
    }
}
let currentInterval = null;
function recordShot(playerNo) {
    if (accuracies[playerNo]) {
        accuracies[playerNo].total++;
    }
}

function recordShotHit(playerNo) {
    if (accuracies[playerNo]) {
        accuracies[playerNo].hits++;
    }
}

function resetStats() {
    const accuracyContainer = document.querySelector(".accuracy-container");
    if (accuracyContainer) {
        accuracyContainer.classList.remove("hide");
    }
    Object.keys(accuracies).forEach(key => {
        accuracies[key].total = 0;
        accuracies[key].hits = 0;
    });
    updateAccuracy();
}

function calcAccuracy() {
    if (totalShots === 0) return "0%";
    return Math.round((shotsHit / totalShots) * 100) + "%";
}

function updateAccuracy() {
    const accCounts = document.querySelectorAll(".accuracy-count");
    accCounts.forEach((accCount, index) => {
        const playerIndex = index + 1;
        const accuracy = accuracies[playerIndex];
        if (accuracy) {
            accCount.textContent = `${accuracy.hits}/${accuracy.total}`;
        } else {
            accCount.textContent = "0/0";
        }
    });

}

function clearElements() {
    // Remove existing targets,red dots, bullet shots
    document.querySelectorAll(".hit-dot").forEach(dot => dot.remove());
    document.querySelectorAll(".target-container").forEach(t => t.remove());
    document.querySelectorAll(".bulletshot").forEach(shot => shot.remove());
}

const targetImage = new Image();
targetImage.src = "/public/assets/target-brown.PNG"; // Ensure the path is correct
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
    const target = targetImage;
    if (isDarkMode()) {
        const blinker = document.createElement("div");
        blinker.className = "blinker";
        targetContainer.appendChild(blinker);
    }

    targetContainer.appendChild(target);
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
    clearElements();
    createTarget(40, 55);
    currentInterval = setInterval(() => {
        clearElements();
        createTarget(40, 55);
    }, 4000);
}

function midMode() {
    // Slow moving targets, 8s
    clearElements();
    createTarget(30, 35, "swaying-slow");
    currentInterval = setInterval(() => {
        clearElements();
        createTarget(30, 35, "swaying-slow");
    }, 8000);
}

function marksmenMode() {
    // Fast moving targets, 6s
    clearElements();
    createTarget(30, 35, "swaying-fast");
    currentInterval = setInterval(() => {
        clearElements();
        createTarget(30, 35, "swaying-fast");
    }, 6000);
}

function playLevel(mode) {
    if (currentInterval) {
        clearInterval(currentInterval);
    }
    if (mode === "easy") {
        easyMode();
    } else if (mode === "mid") {
        midMode();
    } else if (mode === "marksmen") {
        marksmenMode();
    }
}

function toggleNight() {
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

function checkHitElement(element, x, y) {
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


