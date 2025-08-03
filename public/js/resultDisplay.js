function markHitOnBoard(percentX, percentY) {
  const screenTarget = document.querySelector(".screen-target");
  if (!screenTarget) return;

  const dot = document.createElement("div");
  dot.className = "hit-dot";

  // Position relative to the board
  console.log(`Hit marked at: x = ${percentX * 100}%, y = ${percentY * 100}%`);
  dot.style.left = `${percentX * 100}%`;
  dot.style.top = `${percentY * 100}%`;

  screenTarget.appendChild(dot);
}
