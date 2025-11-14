const fallbackStore = new Map();

function getNativeStorage() {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage;
    }
  } catch (error) {
    console.warn('localStorage unavailable on window', error);
  }

  try {
    if (typeof globalThis !== 'undefined' && globalThis.localStorage) {
      return globalThis.localStorage;
    }
  } catch (error) {
    console.warn('localStorage unavailable on globalThis', error);
  }

  return null;
}

function readFromFallback(key) {
  return fallbackStore.has(key) ? fallbackStore.get(key) : null;
}

export const SafeStorage = {
  getItem(key) {
    const nativeStorage = getNativeStorage();
    if (nativeStorage) {
      try {
        return nativeStorage.getItem(key);
      } catch (error) {
        console.warn(
          'localStorage.getItem failed; using fallback store',
          error
        );
      }
    }
    return readFromFallback(key);
  },

  setItem(key, value) {
    const nativeStorage = getNativeStorage();
    if (nativeStorage) {
      try {
        nativeStorage.setItem(key, value);
        fallbackStore.delete(key);
        return true;
      } catch (error) {
        console.warn(
          'localStorage.setItem failed; using fallback store',
          error
        );
      }
    }
    fallbackStore.set(key, value);
    return false;
  },

  removeItem(key) {
    const nativeStorage = getNativeStorage();
    if (nativeStorage) {
      try {
        nativeStorage.removeItem(key);
        fallbackStore.delete(key);
        return;
      } catch (error) {
        console.warn(
          'localStorage.removeItem failed; using fallback store',
          error
        );
      }
    }
    fallbackStore.delete(key);
  },

  usingFallback() {
    return !getNativeStorage();
  },

  clearFallback() {
    fallbackStore.clear();
  },
};
