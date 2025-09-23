export const getRandomInRange = (min, max) => Math.random() * (max - min) + min;
export const getRandomBool = (probability = 0.5) => Math.random() < probability;
export const getRandomItem = (arr) =>
  arr[Math.floor(Math.random() * arr.length)];
export const getChaosProbability = (baseProb, chaosLevel) =>
  Math.min(baseProb * (chaosLevel / 5), 1);

/** Copies text to the user's clipboard. */
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
  } catch (err) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.top = "-9999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand("copy");
    } catch (execErr) {
      // UIManager.showToast('Failed to copy link.');
    }
    document.body.removeChild(textArea);
  }
};
