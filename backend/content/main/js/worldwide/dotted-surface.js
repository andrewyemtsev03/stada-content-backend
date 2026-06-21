(function () {
  const canvas = document.querySelector("[data-worldwide-dotted-surface]");
  if (!canvas) return;

  const context = canvas.getContext("2d", { alpha: true });
  if (!context) return;

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let width = 0;
  let height = 0;
  let dpr = 1;
  let frameId = 0;
  let time = 0;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function drawBackground() {
    context.clearRect(0, 0, width, height);

    const glow = context.createRadialGradient(width * 0.5, height * 0.42, 0, width * 0.5, height * 0.42, Math.max(width, height) * 0.72);
    glow.addColorStop(0, "rgba(255, 255, 255, 0.92)");
    glow.addColorStop(0.45, "rgba(247, 251, 255, 0.76)");
    glow.addColorStop(1, "rgba(246, 248, 251, 0)");
    context.fillStyle = glow;
    context.fillRect(0, 0, width, height);
  }

  function drawDots() {
    const spacing = Math.max(24, Math.min(42, width / 34));
    const rows = Math.ceil(height / spacing) + 10;
    const cols = Math.ceil(width / spacing) + 10;
    const startX = (width - cols * spacing) / 2;
    const startY = height * 0.58 - rows * spacing * 0.34;

    context.fillStyle = "rgba(0, 49, 99, 0.34)";

    for (let xIndex = 0; xIndex < cols; xIndex += 1) {
      for (let yIndex = 0; yIndex < rows; yIndex += 1) {
        const wave =
          Math.sin((xIndex + time) * 0.32) * 16 +
          Math.sin((yIndex + time) * 0.46) * 18;
        const perspective = 1 + yIndex / rows;
        const x = startX + xIndex * spacing;
        const y = startY + yIndex * spacing * 0.58 + wave;
        const dotSize = Math.max(1.2, 2.9 - yIndex / rows);
        const alpha = Math.max(0.08, 0.38 - Math.abs(y - height * 0.58) / height * 0.42);

        context.globalAlpha = alpha;
        context.beginPath();
        context.arc(x, y, dotSize / perspective, 0, Math.PI * 2);
        context.fill();
      }
    }

    context.globalAlpha = 1;
  }

  function render() {
    drawBackground();
    drawDots();
  }

  function animate() {
    render();
    if (!prefersReducedMotion.matches) {
      time += 0.025;
      frameId = window.requestAnimationFrame(animate);
    }
  }

  function restart() {
    window.cancelAnimationFrame(frameId);
    resize();
    animate();
  }

  window.addEventListener("resize", restart, { passive: true });
  prefersReducedMotion.addEventListener?.("change", restart);
  restart();
})();
