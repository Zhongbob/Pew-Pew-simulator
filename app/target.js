function targetup() {
  setInterval(() => {
    // Remove existing targets
    document.querySelectorAll(".hit-dot").forEach(dot => dot.remove());
    document.querySelectorAll(".target").forEach(t => t.remove());

    const target = document.createElement("img");
    target.src = "/public/assets/target.PNG";
    target.className = "target";
    target.style.position = 'absolute';

    const x = Math.random() * (window.innerWidth - 30);
    const y = 305;

    // Log coordinates to console
    console.log(`Target appeared at: x = ${Math.round(x)}, y = ${Math.round(y)}`);

    target.style.left = x + 'px';
    target.style.top = y + 'px';
    target.style.width = '40px';
    target.style.height = '55px';
    target.style.pointerEvents = 'auto';
    
    target.addEventListener("click", (event) => {
        const rect = target.getBoundingClientRect();
        const offsetX = event.clientX - rect.left;
        const offsetY = event.clientY - rect.top;

        const percentX = offsetX / rect.width;
        const percentY = offsetY / rect.height;

        markHitOnBoard(percentX, percentY);

    });

    document.body.appendChild(target);
  }, 5000);
}