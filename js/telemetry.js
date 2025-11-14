import { copyToClipboard } from './utils.js';

const MAX_EVENTS = 50;
const events = [];
const isDevEnvironment =
  typeof process !== 'undefined' &&
  process.env &&
  process.env.NODE_ENV !== 'production';

function pushEvent(entry) {
  const enrichedEntry = {
    timestamp: new Date().toISOString(),
    ...entry,
  };
  events.push(enrichedEntry);
  if (events.length > MAX_EVENTS) {
    events.shift();
  }
  if (isDevEnvironment) {
    console.debug('[Telemetry]', enrichedEntry.type, enrichedEntry.payload);
  }
}

export const Telemetry = {
  log(type, payload = {}) {
    pushEvent({ type, payload });
  },

  logError(type, error, context = {}) {
    const payload = {
      message: error && error.message ? error.message : 'Unknown error',
      stack:
        error && error.stack
          ? error.stack.split('\n').slice(0, 5).join('\n')
          : undefined,
      ...context,
    };
    pushEvent({ type: `error:${type}`, payload });
  },

  getEvents() {
    return [...events];
  },

  export() {
    return JSON.stringify({ events: this.getEvents() }, null, 2);
  },

  async copyToClipboard() {
    const payload = this.export();
    await copyToClipboard(payload);
    return payload.length;
  },

  clear() {
    events.length = 0;
  },
};

if (typeof window !== 'undefined') {
  window.tsDiceTelemetry = Telemetry;
}
