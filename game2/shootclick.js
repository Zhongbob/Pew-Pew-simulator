function placeShotAt(x, y) {
  const img = document.createElement('img');
  img.src = 'img/bullet.png';
  img.className = "bulletshot";
  img.style.position = 'absolute';
  const imgWidth = 20;
  const imgHeight = 20;
  img.style.width = imgWidth + 'px';
  img.style.height = imgHeight + 'px';
  img.style.pointerEvents = 'none';

  // Center the image on (x, y)
  img.style.left = (x - imgWidth / 2) + 'px';
  img.style.top = (y - imgHeight / 2) + 'px';

  document.body.appendChild(img);

  setTimeout(() => {
    img.remove();
  }, 2000);
}
// Preload the video once
const smokeTemplate = document.createElement('video');
smokeTemplate.src = 'img/smoke.webm';
smokeTemplate.autoplay = true;
smokeTemplate.loop = false;
smokeTemplate.muted = true;
smokeTemplate.playsInline = true;
smokeTemplate.preload = 'auto'; // Preload for caching

function placeSmokeAt(x, y) {
  // Clone the preloaded video
  const smoke = smokeTemplate.cloneNode(true);
  smoke.style.position = 'absolute';
  smoke.style.left = (x - 50) + 'px';
  smoke.style.top = (y - 75) + 'px';

  // Append to body
  document.body.appendChild(smoke);

  // Remove it after it ends
  smoke.addEventListener('ended', () => {
    smoke.remove();
  });
}


function checkHit(x, y) {
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

      const offsetX = x - rect.left;
      const offsetY = y - rect.top;
      const percentX = offsetX / rect.width;
      const percentY = offsetY / rect.height;

      markHitOnBoard(percentX, percentY);
    };
  }
}

function shoot(x, y) {
  let xPixels = x / 100 * window.innerWidth;
  let yPixels = y / 100 * window.innerHeight;
  placeShotAt(xPixels, yPixels);
  placeSmokeAt(xPixels, yPixels);
  const gunshot = new Audio("sounds/gunshot.mp3");
  gunshot.play();
  checkHit(xPixels, yPixels);
  updateAccuracy();
  recordShot();
}

document.addEventListener('click', (event) => {
  placeShotAt(event.clientX, event.clientY);
  placeSmokeAt(event.clientX, event.clientY);
  const gunshot = new Audio("sounds/gunshot.mp3");
  gunshot.play();
  checkHit(event.clientX, event.clientY);
  updateAccuracy();
  recordShot();
});