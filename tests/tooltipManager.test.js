import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { initTooltipManager } from '../js/tooltipManager.js';
import { SafeStorage } from '../js/storage.js';
import { TOOLTIP_DELAY, TOOLTIP_AUTO_HIDE } from '../js/constants.js';

function buildSubMenu() {
  const subMenu = document.createElement('div');
  subMenu.className = 'sub-menu';
  const button = document.createElement('button');
  button.className = 'menu-button';
  button.title = 'Shuffle All: Generate a new scene (Alt+A)';
  subMenu.appendChild(button);
  document.body.appendChild(subMenu);
  return { subMenu, button };
}

beforeEach(() => {
  document.body.innerHTML = '';
  SafeStorage.clearFallback();
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('initTooltipManager', () => {
  it('creates a #custom-tooltip element when missing', () => {
    const { subMenu } = buildSubMenu();
    initTooltipManager(subMenu);
    expect(document.getElementById('custom-tooltip')).toBeTruthy();
  });

  it('is a no-op when no container is passed', () => {
    initTooltipManager(null);
    expect(document.getElementById('custom-tooltip')).toBeNull();
  });

  it('builds rich tooltip content from the title after delay', () => {
    const { subMenu, button } = buildSubMenu();
    initTooltipManager(subMenu);

    const tooltip = document.getElementById('custom-tooltip');
    button.dispatchEvent(
      new MouseEvent('mouseover', { bubbles: true, clientX: 10, clientY: 10 })
    );

    expect(tooltip.classList.contains('visible')).toBe(false);
    vi.advanceTimersByTime(TOOLTIP_DELAY);
    expect(tooltip.classList.contains('visible')).toBe(true);
    expect(tooltip.querySelector('strong')).toBeTruthy();
    expect(tooltip.querySelector('code').textContent).toBe('Alt+A');
    expect(tooltip.querySelector('span').textContent).toBe(
      'Generate a new scene'
    );
    expect(button.getAttribute('data-title')).toContain('Shuffle All');
    expect(button.hasAttribute('title')).toBe(false);
  });

  it('auto-hides tooltip after TOOLTIP_AUTO_HIDE', () => {
    const { subMenu, button } = buildSubMenu();
    initTooltipManager(subMenu);
    const tooltip = document.getElementById('custom-tooltip');

    button.dispatchEvent(
      new MouseEvent('mouseover', { bubbles: true, clientX: 10, clientY: 10 })
    );
    vi.advanceTimersByTime(TOOLTIP_DELAY);
    expect(tooltip.classList.contains('visible')).toBe(true);

    vi.advanceTimersByTime(TOOLTIP_AUTO_HIDE);
    expect(tooltip.classList.contains('visible')).toBe(false);
  });

  it('mouseout restores the title attribute and hides tooltip', () => {
    const { subMenu, button } = buildSubMenu();
    initTooltipManager(subMenu);
    const tooltip = document.getElementById('custom-tooltip');

    button.dispatchEvent(
      new MouseEvent('mouseover', { bubbles: true, clientX: 1, clientY: 1 })
    );
    vi.advanceTimersByTime(TOOLTIP_DELAY);

    button.dispatchEvent(new MouseEvent('mouseout', { bubbles: true }));
    expect(tooltip.classList.contains('visible')).toBe(false);
    expect(button.getAttribute('title')).toContain('Shuffle All');
    expect(button.hasAttribute('data-title')).toBe(false);
  });

  it('hides tooltip on outside click', () => {
    const { subMenu, button } = buildSubMenu();
    initTooltipManager(subMenu);
    const tooltip = document.getElementById('custom-tooltip');

    button.dispatchEvent(
      new MouseEvent('mouseover', { bubbles: true, clientX: 1, clientY: 1 })
    );
    vi.advanceTimersByTime(TOOLTIP_DELAY);
    expect(tooltip.classList.contains('visible')).toBe(true);

    document.body.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(tooltip.classList.contains('visible')).toBe(false);
  });
});
