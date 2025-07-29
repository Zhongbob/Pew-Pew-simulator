function spawnTargetBottomRight() {
  // Remove existing targets so you don’t stack them
  document.querySelectorAll(".target").forEach(t => t.remove());

  // Create image element
  const target = document.createElement("img");
  target.src = "img/target.PNG";  // Make sure this path is correct
  target.className = "bottomRightTarget";

  // Style it to bottom right
  target.style.position = 'absolute';
  target.style.width = '80px';
  target.style.height = '110px';
  target.style.right = '20px';    // 20px from the right edge
  target.style.bottom = '20px';   // 20px from the bottom edge
  target.style.pointerEvents = 'auto';  // allow clicks if needed

  // Add to body
  document.body.appendChild(target);
}

function markHitOnBoard(percentX, percentY) {
  const board = document.querySelector(".bottomRightTarget");
  if (!board) return;

  const rect = board.getBoundingClientRect();

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