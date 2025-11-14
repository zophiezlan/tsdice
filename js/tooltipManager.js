import { TOOLTIP_DELAY, TOOLTIP_AUTO_HIDE } from './constants.js';

/**
 * Detect if the device is primarily touch-based
 * @returns {boolean} True if touch device
 */
function isTouchDevice() {
  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    navigator.msMaxTouchPoints > 0
  );
}

/**
 * Initialise tooltip behavior for menu controls.
 * Creates a single tooltip element and wires mouse and touch handlers.
 * On touch devices, tooltips are disabled by default to prevent annoying popups.
 *
 * @param {HTMLElement} subMenuEl - The sub-menu root containing controls
 */
export function initTooltipManager(subMenuEl) {
  if (!subMenuEl) return;

  // Create tooltip if not present
  let tooltip = document.getElementById('custom-tooltip');
  if (!tooltip) {
    tooltip = document.createElement('div');
    tooltip.id = 'custom-tooltip';
    document.body.appendChild(tooltip);
  }

  // Check if this is a touch device
  const isTouch = isTouchDevice();

  // Get user preference for tooltips (defaults to disabled on touch devices)
  const tooltipPreference = localStorage.getItem('tsDiceTooltipsEnabled');
  const tooltipsEnabled =
    tooltipPreference !== null ? tooltipPreference === 'true' : !isTouch; // Disabled by default on touch devices

  // If tooltips are disabled and it's a touch device, skip setup
  if (!tooltipsEnabled && isTouch) {
    // Store preference if not set
    if (tooltipPreference === null) {
      localStorage.setItem('tsDiceTooltipsEnabled', 'false');
    }
    return;
  }

  let tooltipTimeout;
  let tooltipHideTimeout;

  function updateTooltipPosition(mouseX, mouseY) {
    const tooltipRect = tooltip.getBoundingClientRect();
    const padding = 15;
    let top = mouseY - tooltipRect.height - padding;
    let left = mouseX - tooltipRect.width / 2;

    if (top < padding) top = mouseY + padding;
    if (left < padding) left = padding;
    if (left + tooltipRect.width > window.innerWidth - padding)
      left = window.innerWidth - tooltipRect.width - padding;

    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;
  }

  function hideTooltip() {
    clearTimeout(tooltipTimeout);
    clearTimeout(tooltipHideTimeout);
    tooltip.classList.remove('visible');
  }

  // Hide tooltip when clicking anywhere on the page
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.menu-button, .slider-container')) {
      hideTooltip();
    }
  });

  // Hide tooltip on scroll (mobile)
  document.addEventListener('scroll', hideTooltip, { passive: true });

  subMenuEl.addEventListener('mouseover', (e) => {
    const target = e.target.closest('.menu-button, .slider-container');
    if (!target || !target.title) return;

    // Clear any existing timeout
    clearTimeout(tooltipTimeout);
    clearTimeout(tooltipHideTimeout);

    target.setAttribute('data-title', target.title);
    target.removeAttribute('title');
    const titleText = target.getAttribute('data-title');
    const shortcutMatch = titleText.match(/\(([^)]+)\)/);
    const cleanTitle = titleText.replace(/\s*\(([^)]+)\)/, '');
    const [name, description] = cleanTitle.split(': ');

    tooltip.innerHTML = ''; // Clear previous content
    const strong = document.createElement('strong');
    strong.textContent = name + ' ';

    if (shortcutMatch) {
      const code = document.createElement('code');
      code.textContent = shortcutMatch[1];
      strong.appendChild(code);
    }

    const span = document.createElement('span');
    span.textContent = description || '';

    tooltip.appendChild(strong);
    tooltip.appendChild(span);

    // Delay showing the tooltip
    tooltipTimeout = setTimeout(() => {
      tooltip.classList.add('visible');
      updateTooltipPosition(e.clientX, e.clientY);

      // Auto-hide after a while (helpful for touch devices)
      tooltipHideTimeout = setTimeout(() => {
        hideTooltip();
      }, TOOLTIP_AUTO_HIDE);
    }, TOOLTIP_DELAY);
  });

  subMenuEl.addEventListener('mouseout', (e) => {
    const target = e.target.closest('.menu-button, .slider-container');
    if (!target || !target.getAttribute('data-title')) return;

    // Clear timeout to prevent tooltip from showing after mouse has left
    clearTimeout(tooltipTimeout);
    clearTimeout(tooltipHideTimeout);

    tooltip.classList.remove('visible');
    target.setAttribute('title', target.getAttribute('data-title'));
    target.removeAttribute('data-title');
  });

  // Touch event handlers for mobile
  subMenuEl.addEventListener(
    'touchstart',
    (e) => {
      const target = e.target.closest('.menu-button, .slider-container');
      if (target) {
        // Hide any existing tooltip on touch
        hideTooltip();
      }
    },
    { passive: true }
  );

  subMenuEl.addEventListener('mousemove', (e) => {
    if (tooltip.classList.contains('visible'))
      updateTooltipPosition(e.clientX, e.clientY);
  });
}
