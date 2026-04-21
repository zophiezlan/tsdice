import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ModalManager } from '../js/modalManager.js';
import { AppState } from '../js/state.js';

function buildModal(innerHtml = '') {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = innerHtml;
  document.body.appendChild(modal);
  return modal;
}

beforeEach(() => {
  document.body.innerHTML = '';
  ModalManager.modals.clear();
  AppState.ui.lastFocusedElement = null;
});

describe('ModalManager', () => {
  describe('register + open + close', () => {
    it('opens a registered modal and focuses the primary control', () => {
      const modal = buildModal(
        `<button id="primary">Primary</button><button class="modal-close-btn" id="close">Close</button>`
      );
      const close = modal.querySelector('#close');
      ModalManager.register('test', modal, close);

      ModalManager.open('test');

      expect(modal.classList.contains('visible')).toBe(true);
      expect(document.activeElement.id).toBe('primary');
    });

    it('honors [data-initial-focus] over first focusable', () => {
      const modal = buildModal(
        `<button id="a">A</button><button id="b" data-initial-focus>B</button>`
      );
      ModalManager.register('t', modal, modal.querySelector('#a'));

      ModalManager.open('t');
      expect(document.activeElement.id).toBe('b');
    });

    it('close removes visible class', () => {
      const modal = buildModal(`<button class="modal-close-btn">X</button>`);
      ModalManager.register(
        'm',
        modal,
        modal.querySelector('.modal-close-btn')
      );
      ModalManager.open('m');
      ModalManager.close('m');
      expect(modal.classList.contains('visible')).toBe(false);
    });

    it('close button click dismisses the modal', () => {
      const modal = buildModal(`<button class="modal-close-btn">X</button>`);
      const close = modal.querySelector('.modal-close-btn');
      ModalManager.register('m', modal, close);
      ModalManager.open('m');

      close.click();
      expect(modal.classList.contains('visible')).toBe(false);
    });

    it('Escape key dismisses the modal', () => {
      const modal = buildModal(`<button class="modal-close-btn">X</button>`);
      ModalManager.register(
        'm',
        modal,
        modal.querySelector('.modal-close-btn')
      );
      ModalManager.open('m');

      modal.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })
      );
      expect(modal.classList.contains('visible')).toBe(false);
    });

    it('click on overlay (not content) dismisses', () => {
      const modal = buildModal(
        `<div class="modal-content"><button class="modal-close-btn">X</button></div>`
      );
      ModalManager.register(
        'm',
        modal,
        modal.querySelector('.modal-close-btn')
      );
      ModalManager.open('m');

      const overlayEvent = new MouseEvent('click', { bubbles: true });
      modal.dispatchEvent(overlayEvent);
      expect(modal.classList.contains('visible')).toBe(false);
    });

    it('custom onDismiss is invoked instead of default close', () => {
      const modal = buildModal(`<button class="modal-close-btn">X</button>`);
      const close = modal.querySelector('.modal-close-btn');
      const onDismiss = vi.fn();
      ModalManager.register('m', modal, close, onDismiss);

      close.click();
      expect(onDismiss).toHaveBeenCalledOnce();
      // Modal stays visible when custom dismiss doesn't close
      ModalManager.open('m');
      expect(modal.classList.contains('visible')).toBe(true);
    });

    it('open/close on unregistered id warns without throwing', () => {
      expect(() => ModalManager.open('none')).not.toThrow();
      expect(() => ModalManager.close('none')).not.toThrow();
    });
  });

  describe('isOpen + closeAll', () => {
    it('isOpen reports visibility', () => {
      const modal = buildModal(`<button class="modal-close-btn">X</button>`);
      ModalManager.register(
        'a',
        modal,
        modal.querySelector('.modal-close-btn')
      );
      expect(ModalManager.isOpen('a')).toBe(false);
      ModalManager.open('a');
      expect(ModalManager.isOpen('a')).toBe(true);
    });

    it('closeAll dismisses all open modals', () => {
      const m1 = buildModal(`<button class="modal-close-btn">X</button>`);
      const m2 = buildModal(`<button class="modal-close-btn">X</button>`);
      ModalManager.register('a', m1, m1.querySelector('.modal-close-btn'));
      ModalManager.register('b', m2, m2.querySelector('.modal-close-btn'));

      ModalManager.open('a');
      ModalManager.open('b');
      ModalManager.closeAll();

      expect(m1.classList.contains('visible')).toBe(false);
      expect(m2.classList.contains('visible')).toBe(false);
    });
  });

  describe('focus trap', () => {
    it('Tab on last element wraps to first', () => {
      const modal = buildModal(
        `<button id="first">A</button><a href="#" id="mid">mid</a><button id="last">Z</button>`
      );
      ModalManager.register('t', modal, modal.querySelector('#first'));
      ModalManager.open('t');

      modal.querySelector('#last').focus();
      const event = new KeyboardEvent('keydown', {
        key: 'Tab',
        bubbles: true,
        cancelable: true,
      });
      modal.dispatchEvent(event);

      expect(document.activeElement.id).toBe('first');
      expect(event.defaultPrevented).toBe(true);
    });

    it('Shift+Tab on first wraps to last', () => {
      const modal = buildModal(
        `<button id="first">A</button><button id="last">Z</button>`
      );
      ModalManager.register('t', modal, modal.querySelector('#first'));
      ModalManager.open('t');

      modal.querySelector('#first').focus();
      const event = new KeyboardEvent('keydown', {
        key: 'Tab',
        shiftKey: true,
        bubbles: true,
        cancelable: true,
      });
      modal.dispatchEvent(event);

      expect(document.activeElement.id).toBe('last');
      expect(event.defaultPrevented).toBe(true);
    });
  });
});
