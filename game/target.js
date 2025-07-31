
function targetup() {
  setInterval(() => {
    // Remove existing targets,red dots, bullet shots
    document.querySelectorAll(".hit-dot").forEach(dot => dot.remove());
    document.querySelectorAll(".target").forEach(t => t.remove());
    document.querySelectorAll(".bulletshot").forEach(shot => shot.remove());

    // Find backdrop element
    const backdrop = document.getElementById("backdrop");

    const x = (Math.random() * (0.9 - 0.1) + 0.1) * (window.innerWidth - 30);
    const y = (Math.random() * (0.58 - 0.5) + 0.5) * (window.innerHeight);
    
    // Log coordinates to console
    console.log(`Target appeared at: x = ${Math.round(x)}, y = ${Math.round(y)}`);

    // Creating target
    const target = document.createElement("img");
    target.src = "img-updated/target-brown.PNG";
    target.className = "target";
    target.style.position = 'absolute';
    target.style.left = x + 'px';
    target.style.top = y + 'px';
    target.style.width = '40px';
    target.style.height = '55px';
    target.style.zIndex = "0";
    target.style.pointerEvents = 'auto';
    
    target.addEventListener("click", (event) => {
      console.log("Target hit.");
      recordShotHit()
      const rect = target.getBoundingClientRect();
      const offsetX = event.clientX - rect.left;
      const offsetY = event.clientY - rect.top;

      const percentX = offsetX / rect.width;
      const percentY = offsetY / rect.height;

      markHitOnBoard(percentX, percentY);

    });

    backdrop.appendChild(target);
  }, 5000);
}

