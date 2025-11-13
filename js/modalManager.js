import { UIManager } from "./uiManager.js";

/**
 * Unified Modal Manager - handles all modal operations consistently
 */
export const ModalManager = {
  modals: new Map(),

  /** Register a modal with its close button and optional dismiss callback */
  register(modalId, modal, closeButton, onDismiss = null) {
    const dismissFn = onDismiss || (() => this.close(modalId));

    closeButton.addEventListener("click", dismissFn);
    modal.addEventListener("keydown", (e) => {
      if (e.key === "Escape") dismissFn();
      else trapFocus(e, modal);
    });
    modal.addEventListener("click", (e) => {
      if (e.target === modal) dismissFn();
    });

    this.modals.set(modalId, { modal, closeButton, dismissFn });
  },

  /** Open a modal by ID */
  open(modalId, returnFocusElement = null) {
    const modalData = this.modals.get(modalId);
    if (!modalData) {
      console.warn(`Modal "${modalId}" not registered`);
      return;
    }

    UIManager.openModal(modalData.modal, returnFocusElement);
  },

  /** Close a modal by ID */
  close(modalId) {
    const modalData = this.modals.get(modalId);
    if (!modalData) {
      console.warn(`Modal "${modalId}" not registered`);
      return;
    }

    UIManager.closeModal(modalData.modal);
  },

  /** Check if a modal is currently open */
  isOpen(modalId) {
    const modalData = this.modals.get(modalId);
    return modalData?.modal.classList.contains("visible") || false;
  },

  /** Close all open modals */
  closeAll() {
    this.modals.forEach((data, id) => {
      if (this.isOpen(id)) {
        this.close(id);
      }
    });
  },
};

/**
 * Trap focus within a modal for accessibility. Copied from existing logic.
 */
function trapFocus(e, modal) {
  if (e.key !== "Tab") return;
  const focusableElements = modal.querySelectorAll("button, [href]");
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  if (e.shiftKey) {
    // Shift + Tab
    if (document.activeElement === firstElement) {
      lastElement.focus();
      e.preventDefault();
    }
  } else {
    // Tab
    if (document.activeElement === lastElement) {
      firstElement.focus();
      e.preventDefault();
    }
  }
}
