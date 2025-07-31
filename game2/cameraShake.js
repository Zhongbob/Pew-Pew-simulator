function cameraShake(duration = 300, intensity = 5) {
  const backdrop = document.getElementById("backdrop");
  if (!backdrop) return;

  const start = performance.now();

  function shakeFrame(now) {
    const elapsed = now - start;
    if (elapsed < duration) {
      const dx = (Math.random() * 2 - 1) * intensity;
      const dy = (Math.random() * 2 - 1) * intensity;
      backdrop.style.transform = `translate(${dx}px, ${dy}px) scale(1)`;  // keep scale(1) so you don't override your zoom reset
      requestAnimationFrame(shakeFrame);
    } else {
      backdrop.style.transform = "scale(1)";  // reset to normal scale & no translation
    }
  }

  requestAnimationFrame(shakeFrame);
}