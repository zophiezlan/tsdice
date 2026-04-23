export const getRandomInRange = (min, max) => Math.random() * (max - min) + min;
export const getRandomBool = (probability = 0.5) => Math.random() < probability;
export const getRandomItem = (arr) =>
  arr[Math.floor(Math.random() * arr.length)];
export const getChaosProbability = (baseProb, chaosLevel) =>
  Math.min(baseProb * (chaosLevel / 5), 1);

/**
 * Returns a random subset of up to `size` unique items from `arr` using a
 * Fisher-Yates partial shuffle. If `size >= arr.length`, returns a shuffled
 * copy of the whole array.
 */
export const getRandomSubset = (arr, size) => {
  const n = Math.min(Math.max(0, Math.floor(size)), arr.length);
  const copy = arr.slice();
  for (let i = 0; i < n; i++) {
    const j = i + Math.floor(Math.random() * (copy.length - i));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, n);
};

/**
 * Debounce function - delays execution until after wait milliseconds have passed
 * since the last time it was invoked.
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/** Copies text to the user's clipboard. */
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.top = '-9999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
    } catch {
      // UIManager.showToast('Failed to copy link.');
    }
    document.body.removeChild(textArea);
  }
};
