import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Telemetry } from '../js/telemetry.js';
import * as utils from '../js/utils.js';

beforeEach(() => {
  Telemetry.clear();
});

describe('Telemetry.log', () => {
  it('stores events with timestamp, type, and payload', () => {
    Telemetry.log('user:click', { id: 'foo' });
    const [event] = Telemetry.getEvents();
    expect(event.type).toBe('user:click');
    expect(event.payload).toEqual({ id: 'foo' });
    expect(typeof event.timestamp).toBe('string');
  });

  it('defaults payload to empty object', () => {
    Telemetry.log('bare');
    expect(Telemetry.getEvents()[0].payload).toEqual({});
  });

  it('caps history at 50 entries (FIFO)', () => {
    for (let i = 0; i < 60; i++) Telemetry.log('x', { i });
    const events = Telemetry.getEvents();
    expect(events).toHaveLength(50);
    expect(events[0].payload.i).toBe(10);
    expect(events[49].payload.i).toBe(59);
  });
});

describe('Telemetry.logError', () => {
  it('prefixes the type with "error:" and captures message/stack', () => {
    const err = new Error('boom');
    Telemetry.logError('load', err, { source: 'unit' });
    const [event] = Telemetry.getEvents();
    expect(event.type).toBe('error:load');
    expect(event.payload.message).toBe('boom');
    expect(event.payload.source).toBe('unit');
    expect(typeof event.payload.stack).toBe('string');
  });

  it('handles missing error object gracefully', () => {
    Telemetry.logError('nil', null);
    expect(Telemetry.getEvents()[0].payload.message).toBe('Unknown error');
  });

  it('truncates stack to 5 lines', () => {
    const err = new Error('multi');
    err.stack = Array.from({ length: 20 }, (_, i) => `line ${i}`).join('\n');
    Telemetry.logError('t', err);
    const stack = Telemetry.getEvents()[0].payload.stack;
    expect(stack.split('\n')).toHaveLength(5);
  });
});

describe('Telemetry.export / getEvents', () => {
  it('getEvents returns a defensive copy', () => {
    Telemetry.log('a');
    const snapshot = Telemetry.getEvents();
    snapshot.push({ type: 'injected' });
    expect(Telemetry.getEvents()).toHaveLength(1);
  });

  it('export returns a JSON string with an events array', () => {
    Telemetry.log('a');
    const parsed = JSON.parse(Telemetry.export());
    expect(Array.isArray(parsed.events)).toBe(true);
    expect(parsed.events[0].type).toBe('a');
  });
});

describe('Telemetry.copyToClipboard', () => {
  it('delegates to utils.copyToClipboard and returns payload length', async () => {
    const spy = vi.spyOn(utils, 'copyToClipboard').mockResolvedValue(undefined);
    Telemetry.log('k');
    const len = await Telemetry.copyToClipboard();
    expect(spy).toHaveBeenCalled();
    expect(len).toBe(spy.mock.calls[0][0].length);
    spy.mockRestore();
  });
});

describe('Telemetry.clear', () => {
  it('empties the event history', () => {
    Telemetry.log('a');
    Telemetry.log('b');
    Telemetry.clear();
    expect(Telemetry.getEvents()).toHaveLength(0);
  });
});
