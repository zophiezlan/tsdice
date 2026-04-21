import { AppState } from './state.js';
import { UIManager } from './uiManager.js';
import { Telemetry } from './telemetry.js';
import { ErrorHandler, ErrorType } from './errorHandler.js';
import { copyToClipboard, getRandomItem } from './utils.js';
import { emojiOptions, TIMING } from './constants.js';

const EMOJI_COUNT = 8;
const SHORTEN_ENDPOINT = 'https://my.ket.horse/emoji';

const generateRandomEmojiString = (count) => {
  let out = '';
  for (let i = 0; i < count; i++) out += getRandomItem(emojiOptions);
  return out;
};

async function createEmojiShortUrl(longUrl) {
  const controller = new AbortController();
  const timeoutId = setTimeout(
    () => controller.abort(),
    TIMING.SHARE_FETCH_TIMEOUT
  );
  try {
    Telemetry.log('share:shorten:start', { urlLength: longUrl.length });
    const response = await fetch(SHORTEN_ENDPOINT, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      signal: controller.signal,
      body: new URLSearchParams({
        url: longUrl,
        emojies: generateRandomEmojiString(EMOJI_COUNT),
      }),
    });
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    const payload = await response.json();
    Telemetry.log('share:shorten:success', {
      hasUrl: Boolean(payload.short_url),
    });
    return payload.short_url;
  } catch (error) {
    const aborted = error && error.name === 'AbortError';
    Telemetry.logError('share:shorten', error, { aborted });
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
}

function buildSharableConfig() {
  const sharableConfig = structuredClone(AppState.particleState.currentConfig);
  sharableConfig.uiState = {
    chaosLevel: AppState.particleState.chaosLevel,
    isDarkMode: AppState.ui.isDarkMode,
    isCursorParticle: AppState.ui.isCursorParticle,
    isGravityOn: AppState.ui.isGravityOn,
    areWallsOn: AppState.ui.areWallsOn,
    originalOutModes: AppState.ui.areWallsOn
      ? AppState.particleState.originalOutModes
      : undefined,
  };
  return sharableConfig;
}

/**
 * Creates a shareable URL for the current scene and copies it to clipboard.
 * Always restores the button's enabled state, even on failure.
 */
export async function handleShareClick(button) {
  const hasConfig =
    AppState.particleState.currentConfig &&
    Object.keys(AppState.particleState.currentConfig).length > 0;
  Telemetry.log('share:start', { hasConfig });

  const handleShare = ErrorHandler.wrap(async () => {
    const sharableConfig = buildSharableConfig();

    button.classList.add('disabled');
    UIManager.showToast('⏳ Creating shareable link...');
    UIManager.announce('Creating shareable link');
    Telemetry.log('share:compress:start', {
      chaos: AppState.particleState.chaosLevel,
    });

    const compressedConfig = LZString.compressToEncodedURIComponent(
      JSON.stringify(sharableConfig)
    );
    const fullUrl = `${window.location.href.split('#')[0]}#config=${compressedConfig}`;
    Telemetry.log('share:compress:complete', { size: compressedConfig.length });

    let finalUrl = fullUrl;
    const shortUrl = await createEmojiShortUrl(fullUrl);
    if (shortUrl) finalUrl = shortUrl;

    await copyToClipboard(finalUrl);

    const isShortened = finalUrl !== fullUrl;
    if (isShortened) {
      UIManager.showToast(`✓ Short link copied! ${finalUrl.split('/').pop()}`);
      UIManager.announce('Short emoji link copied to clipboard');
    } else {
      UIManager.showToast('✓ Link copied to clipboard');
      UIManager.announce('Full configuration link copied to clipboard');
    }

    Telemetry.log('share:copied', {
      shortened: isShortened,
      urlLength: finalUrl.length,
    });
    return { shortened: isShortened };
  }, ErrorType.SHARE_FAILED);

  try {
    const shareResult = await handleShare();
    Telemetry.log('share:complete', {
      status: shareResult ? 'success' : 'failed',
      shortened: Boolean(shareResult && shareResult.shortened),
    });
  } finally {
    button.classList.remove('disabled');
  }
}
