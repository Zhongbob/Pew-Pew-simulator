const bullet = new Image();
bullet.src = "/public/assets/bullet.png"; 
bullet.className = "bullet";

function placeShotAt(x, y) {
  
  const newBullet = bullet.cloneNode();
  // Center the image on (x, y)
  newBullet.style.left = (x) + 'px';
  newBullet.style.top = (y) + 'px';

  document.body.appendChild(newBullet);

  setTimeout(() => {
    newBullet.remove();
  }, 2000);
}

// Preload the template video (not used directly in DOM)
const smokeTemplate = document.createElement('video');
smokeTemplate.src = '/public/assets/smoke.webm';
smokeTemplate.className = "smoke";
smokeTemplate.autoplay = true;
smokeTemplate.loop = false;
smokeTemplate.muted = true;
smokeTemplate.playsInline = true;
smokeTemplate.preload = 'auto'; // Preload for caching

function placeSmokeAt(x, y) {
  // Clone the preloaded template
  const smokeClone = smokeTemplate.cloneNode(true);
  smokeClone.currentTime = 0; // Ensure it starts at the beginning
  smokeClone.style.left = (x) + 'px';
  smokeClone.style.top = (y) + 'px';

  document.body.appendChild(smokeClone);

  // Play it (required on some browsers)
  smokeClone.play();
  // Remove after it finishes
  smokeClone.onended = () => {
    smokeClone.remove();
  }

}

function checkHit(x, y, playerId) {
  const target = document.getElementById("target");
  if (target) {
    const rect = target.getBoundingClientRect();

    if (
      x >= rect.left &&
      x <= rect.right &&
      y >= rect.top &&
      y <= rect.bottom
    ) {
      console.log("Target hit.");
      recordShotHit();
      if (playerId) {
        hit(playerId);
      }
      const offsetX = x - rect.left;
      const offsetY = y - rect.top;
      const percentX = offsetX / rect.width;
      const percentY = offsetY / rect.height;

      markHitOnBoard(percentX, percentY);
  };
}
} 

const gunshot = new Audio("/public/sounds/gunshot.mp3");
function shoot(x, y, playerId){
  let xPixels = x/100 * window.innerWidth;
  let yPixels = y/100 * window.innerHeight;
  for (const button of difficultyButtons) {
    if (checkHitElement(button, xPixels, yPixels)) {
      button.click();
      return
    }
  }

  placeShotAt(xPixels, yPixels);
  placeSmokeAt(xPixels, yPixels);
  
  const newGunshot = gunshot.cloneNode();
  newGunshot.play();
  newGunshot.onended = () => {
    newGunshot.remove();
  }
  checkHit(xPixels, yPixels,playerId);
  
  updateAccuracy();
  recordShot();
}

window.globalShoot = shoot;
document.addEventListener('click', (event) => {
  shoot(event.clientX*100/window.innerWidth, event.clientY*100/window.innerHeight);
});