/**
 * @fileoverview Browser compatibility shims, imported before tsParticles.
 *
 * tsParticles v4 draws through `canvas.transferControlToOffscreen()` and
 * throws when it is missing — Safari/iOS before 16.4 (e.g. iPhone 6s, 7 and
 * 1st-gen SE, which stop at iOS 15). The engine only builds its own
 * OffscreenCanvas when it has no DOM canvas, and tsDice always gives it one,
 * so returning the DOM canvas itself lets v4 draw straight to the page.
 */

/**
 * Installs the shim when the browser lacks transferControlToOffscreen.
 * @returns {boolean} Whether the shim was installed
 */
export const installOffscreenCanvasShim = () => {
  if (typeof HTMLCanvasElement === 'undefined') return false;
  const proto = HTMLCanvasElement.prototype;
  if (typeof proto.transferControlToOffscreen === 'function') return false;

  proto.transferControlToOffscreen = function transferControlToOffscreen() {
    return this;
  };
  return true;
};

installOffscreenCanvasShim();
