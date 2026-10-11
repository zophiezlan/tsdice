import { describe, it, expect, afterEach } from 'vitest';
import { installOffscreenCanvasShim } from '../js/compat.js';

const proto = HTMLCanvasElement.prototype;
const original = proto.transferControlToOffscreen;

describe('installOffscreenCanvasShim', () => {
  afterEach(() => {
    if (original) proto.transferControlToOffscreen = original;
    else delete proto.transferControlToOffscreen;
  });

  it('makes transferControlToOffscreen return the canvas itself when missing', () => {
    delete proto.transferControlToOffscreen;

    expect(installOffscreenCanvasShim()).toBe(true);
    const canvas = document.createElement('canvas');
    expect(canvas.transferControlToOffscreen()).toBe(canvas);
  });

  it('leaves a native implementation alone', () => {
    const native = function () {
      return 'native';
    };
    proto.transferControlToOffscreen = native;

    expect(installOffscreenCanvasShim()).toBe(false);
    expect(proto.transferControlToOffscreen).toBe(native);
  });
});
