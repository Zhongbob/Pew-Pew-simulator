function markHitOnBoard(percentX, percentY) {
  const screenTarget = document.getElementById("ScreenTarget");
  if (!screenTarget) return;

  const rect = screenTarget.getBoundingClientRect();

  const dot = document.createElement("div");
  dot.className = "hit-dot";
  dot.style.position = 'absolute';
  dot.style.width = '6px';
  dot.style.height = '6px';
  dot.style.backgroundColor = 'red';
  dot.style.borderRadius = '50%';
  dot.style.pointerEvents = 'none';

  // Position relative to the board
  const x = rect.left + percentX * rect.width - 3;
  const y = rect.top + percentY * rect.height - 3;

  dot.style.left = `${x}px`;
  dot.style.top = `${y}px`;

  document.body.appendChild(dot);
}
