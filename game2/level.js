let totalShots = 0;
let shotsHit = 0;

function recordShot(){
    totalShots++;
}

function recordShotHit(){
    shotsHit++;
}

function resetStats(){
    totalShots = 0;
    shotsHit = 0;
}

function calcAccuracy(){
    if (totalShots === 0) return "0%";
    return Math.round((shotsHit / totalShots) * 100) + "%";
}

function updateAccuracy(){
    const currentPercent = document.getElementById("currentPercent");
    if (!currentPercent) return;

    const percentage = calcAccuracy();
    currentPercent.textContent = `${shotsHit}/${totalShots} (${percentage})`;
}

function clearElements(){
    // Remove existing targets,red dots, bullet shots
    document.querySelectorAll(".hit-dot").forEach(dot => dot.remove());
    document.querySelectorAll(".target").forEach(t => t.remove());
    document.querySelectorAll(".bulletshot").forEach(shot => shot.remove());
}


function createTarget(width, height, classname=""){
    // Find backdrop element
    const backdrop = document.getElementById("backdrop");

    const x = (Math.random() * (0.9 - 0.1) + 0.1) * (window.innerWidth - 30);
    const y = (Math.random() * (0.58 - 0.5) + 0.5) * (window.innerHeight);
    
    // Log coordinates to console
    console.log(`Target appeared at: x = ${Math.round(x)}, y = ${Math.round(y)}`);

    // Creating target
    const target = document.createElement("img");
    target.src = "/public/assets/target-brown.PNG";
    target.id = "target"
    target.className = "target " + classname;
    target.style.position = 'absolute';
    target.style.left = x + 'px';
    target.style.top = y + 'px';
    target.style.width = width + 'px';
    target.style.height = height+ 'px';
    target.style.zIndex = "0";
    target.style.pointerEvents = 'auto';
    backdrop.appendChild(target);
}

function easyMode(){
    // Static large targets, 4s
    setInterval(() => {
    clearElements();
    createTarget(40, 55);
    }, 4000);
}

function midMode(){
    // Slow moving targets, 8s
    setInterval(() => {
    clearElements();
    createTarget(30, 35, "swaying-slow");
    }, 8000);
}

function marksmenMode(){
    // Fast moving targets, 6s
    setInterval(() => {
    clearElements();
    createTarget(30, 35, "swaying-fast");
    }, 6000);
}

function playLevel(mode){
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