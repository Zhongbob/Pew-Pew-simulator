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

function createTarget(){
    
}

function easyMode(){
    // Static large targets, 4s
    setInterval(() => {

    });

    targetup();
}

function midMode(){
    // Slow moving targets, 8s

}

function marksmenMode(){
    // Fast moving targets, 6s

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