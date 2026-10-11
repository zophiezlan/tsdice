import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { beginSceneTransition, CROSSFADE_MS } from '../js/sceneTransition.js';

const fakeContainer = () => {
  const domElement = document.createElement('canvas');
  domElement.style.backgroundColor = 'rgb(17, 17, 17)';
  document.getElementById('tsparticles').appendChild(domElement);
  return {
    canvas: { domElement, renderCanvas: { width: 800, height: 600 } },
  };
};

describe('beginSceneTransition', () => {
  let ctx;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal('requestAnimationFrame', (cb) => setTimeout(cb, 0));
    document.body.innerHTML = '<div id="tsparticles"></div><nav></nav>';
    ctx = { fillRect: vi.fn(), drawImage: vi.fn(), fillStyle: '' };
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(ctx);
  });

  afterEach(() => {
    vi.runAllTimers();
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  const overlays = () => document.querySelectorAll('.scene-transition');

  it('does nothing before the first scene exists', () => {
    const transition = beginSceneTransition(null);
    expect(overlays()).toHaveLength(0);
    expect(() => transition.reveal()).not.toThrow();
  });

  it('covers the canvas with the last frame, background included', () => {
    const container = fakeContainer();
    beginSceneTransition(container);

    const [overlay] = overlays();
    expect(overlay.previousElementSibling.id).toBe('tsparticles');
    expect(overlay.width).toBe(800);
    expect(overlay.height).toBe(600);
    expect(overlay.getAttribute('aria-hidden')).toBe('true');
    expect(ctx.fillStyle).toBe('rgb(17, 17, 17)');
    expect(ctx.fillRect).toHaveBeenCalledWith(0, 0, 800, 600);
    expect(ctx.drawImage).toHaveBeenCalledWith(
      container.canvas.renderCanvas,
      0,
      0
    );
  });

  it('fades out over 0.65s once revealed, then removes itself', () => {
    const transition = beginSceneTransition(fakeContainer());
    const [overlay] = overlays();

    vi.advanceTimersByTime(CROSSFADE_MS);
    expect(overlay.isConnected).toBe(true); // held until the scene is ready

    transition.reveal();
    vi.advanceTimersByTime(1);
    expect(overlay.style.transition).toBe('opacity 650ms ease-in-out');
    expect(overlay.style.opacity).toBe('0');

    vi.advanceTimersByTime(CROSSFADE_MS + 250);
    expect(overlays()).toHaveLength(0);
  });

  it('keeps at most three overlays during rapid shuffles', () => {
    for (let i = 0; i < 6; i++) beginSceneTransition(fakeContainer());
    expect(overlays()).toHaveLength(3);
  });

  it('skips the fade when the frame cannot be read', () => {
    ctx.drawImage.mockImplementation(() => {
      throw new Error('tainted');
    });
    beginSceneTransition(fakeContainer());
    expect(overlays()).toHaveLength(0);
  });
});
