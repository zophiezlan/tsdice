/**
 * @fileoverview Cross-fades between scenes.
 *
 * Before a new scene loads, the last frame of the current one (background
 * included) is copied to an overlay above the canvas. Once the new scene is
 * drawing underneath, the overlay fades out. A frozen frame costs one
 * drawImage, so old phones don't have to run two scenes at once.
 */

/** Cross-fade length in milliseconds */
export const CROSSFADE_MS = 650;

/** Overlays still fading, oldest first; capped so spam-clicks stay cheap */
const MAX_OVERLAYS = 3;
const activeOverlays = [];

const removeOverlay = (overlay) => {
  const index = activeOverlays.indexOf(overlay);
  if (index !== -1) activeOverlays.splice(index, 1);
  overlay.remove();
};

/**
 * Snapshots the current scene into an overlay that hides the swap.
 * @param {Object|null} container - The tsParticles container being replaced
 * @returns {{ reveal: () => void }} Call reveal() once the new scene is
 *   loaded (or failed) to fade the old frame away. A no-op when there is
 *   nothing to snapshot.
 */
export const beginSceneTransition = (container) => {
  const noop = { reveal: () => {} };
  const source = container?.canvas?.renderCanvas;
  const domCanvas = container?.canvas?.domElement;
  const host = document.getElementById('tsparticles');
  if (!source || !source.width || !source.height || !host?.parentNode) {
    return noop;
  }

  const overlay = document.createElement('canvas');
  overlay.className = 'scene-transition';
  overlay.setAttribute('aria-hidden', 'true');
  overlay.width = source.width;
  overlay.height = source.height;

  try {
    const ctx = overlay.getContext('2d');
    if (!ctx) return noop;
    // tsParticles paints the background as the canvas's CSS colour, not
    // into the bitmap, so fill it first or theme changes would pop.
    const bg = domCanvas
      ? window.getComputedStyle(domCanvas).backgroundColor
      : '';
    if (bg) {
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, overlay.width, overlay.height);
    }
    ctx.drawImage(source, 0, 0);
  } catch {
    return noop;
  }

  host.parentNode.insertBefore(overlay, host.nextSibling);
  activeOverlays.push(overlay);
  while (activeOverlays.length > MAX_OVERLAYS) {
    removeOverlay(activeOverlays[0]);
  }

  let revealed = false;
  return {
    reveal() {
      if (revealed) return;
      revealed = true;
      overlay.style.transition = `opacity ${CROSSFADE_MS}ms ease-in-out`;
      // Next frame, so the browser commits opacity 1 before fading to 0
      requestAnimationFrame(() => {
        overlay.style.opacity = '0';
      });
      overlay.addEventListener('transitionend', () => removeOverlay(overlay), {
        once: true,
      });
      // Backstop for when transitionend never fires (hidden tab etc.)
      setTimeout(() => removeOverlay(overlay), CROSSFADE_MS + 250);
    },
  };
};
