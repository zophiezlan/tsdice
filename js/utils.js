import { showToast } from './ui.js';

// --- Randomization Helpers ---
export const getRandomInRange = (min, max) => Math.random() * (max - min) + min;
export const getRandomBool = (probability = 0.5) => Math.random() < probability;
export const getRandomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];
export const getChaosProbability = (baseProb, chaosLevel) => Math.min(baseProb * (chaosLevel / 5), 1);

// --- Clipboard and URL ---
export const copyToClipboard = async (text) => {
    try {
        await navigator.clipboard.writeText(text);
        showToast('Short link copied to clipboard!');
    } catch (err) {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.top = "-9999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
            document.execCommand('copy');
            showToast('Short link copied to clipboard!');
        } catch (execErr) {
            showToast('Failed to copy link.');
        }
        document.body.removeChild(textArea);
    }
};

const generateRandomEmojiString = (emojiOptions) => {
    let emojiString = '';
    for (let i = 0; i < 10; i++) {
        emojiString += getRandomItem(emojiOptions);
    }
    return emojiString;
};

async function createShortUrlFallback(longUrl) {
    try {
        const response = await fetch('https://spoo.me/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `url=${encodeURIComponent(longUrl)}`
        });
        if (response.ok) {
            const htmlResponse = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(htmlResponse, 'text/html');
            const shortUrlElement = doc.getElementById('short-url');
            if (shortUrlElement) return shortUrlElement.textContent.trim();
        }
        return null;
    } catch (error) {
        return null;
    }
}

export async function createShortUrl(longUrl, emojiOptions) {
    try {
        const randomEmojiSequence = generateRandomEmojiString(emojiOptions);
        const response = await fetch('https://spoo.me/emoji', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `url=${encodeURIComponent(longUrl)}&emojies=${encodeURIComponent(randomEmojiSequence)}`
        });
        if (response.ok) {
            const jsonResponse = await response.json();
            return jsonResponse.short_url;
        }
        return await createShortUrlFallback(longUrl);
    } catch (error) {
        return await createShortUrlFallback(longUrl);
    }
}
