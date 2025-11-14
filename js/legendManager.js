/**
 * Legend Manager - Handles the quick reference legend overlay
 * Provides a compact, mobile-friendly way to view button functions
 */

/**
 * Initialize the legend overlay functionality
 * @param {HTMLElement} subMenuEl - The sub-menu containing buttons
 */
export function initLegendManager(subMenuEl) {
  if (!subMenuEl) return;

  const legendOverlay = document.getElementById("legend-overlay");
  const legendClose = document.getElementById("legend-close");
  const legendGrid = document.getElementById("legend-grid");
  const legendButton = document.getElementById("btn-legend");

  if (!legendOverlay || !legendClose || !legendGrid || !legendButton) return;

  /**
   * Populate the legend with button information
   */
  function populateLegend() {
    legendGrid.innerHTML = "";

    const controls = subMenuEl.querySelectorAll(
      ".menu-button:not(#btn-legend), .slider-container"
    );

    controls.forEach((control) => {
      const title = control.getAttribute("data-title") || control.title;
      if (!title) return;

      const icon = control.querySelector("svg")?.cloneNode(true);

      // Parse title to extract name and shortcut
      const shortcutMatch = title.match(/\(([^)]+)\)/);
      const cleanTitle = title.replace(/\s*\(([^)]+)\)/, "");
      const [name] = cleanTitle.split(": ");

      // Create legend item
      const item = document.createElement("div");
      item.className = "legend-item";

      // Icon
      const iconWrapper = document.createElement("div");
      iconWrapper.className = "legend-icon";
      if (icon) {
        iconWrapper.appendChild(icon);
      } else if (control.classList.contains("slider-container")) {
        iconWrapper.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 9.5h20M7 4.5v15"/></svg>`;
      }

      // Text
      const textWrapper = document.createElement("div");
      textWrapper.className = "legend-text";

      const nameEl = document.createElement("div");
      nameEl.className = "legend-name";
      nameEl.textContent = name;

      if (shortcutMatch) {
        const shortcutEl = document.createElement("span");
        shortcutEl.className = "legend-shortcut";
        shortcutEl.textContent = shortcutMatch[1];
        nameEl.appendChild(shortcutEl);
      }

      textWrapper.appendChild(nameEl);

      item.appendChild(iconWrapper);
      item.appendChild(textWrapper);
      legendGrid.appendChild(item);
    });
  }

  /**
   * Open the legend overlay
   */
  function openLegend() {
    populateLegend();
    legendOverlay.classList.add("visible");
    legendClose.focus();
    document.body.style.overflow = "hidden";
  }

  /**
   * Close the legend overlay
   */
  function closeLegend() {
    legendOverlay.classList.remove("visible");
    legendButton.focus();
    document.body.style.overflow = "";
  }

  // Event listeners
  legendButton.addEventListener("click", openLegend);
  legendClose.addEventListener("click", closeLegend);

  // Close on overlay click (but not on content click)
  legendOverlay.addEventListener("click", (e) => {
    if (e.target === legendOverlay) {
      closeLegend();
    }
  });

  // Close on escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && legendOverlay.classList.contains("visible")) {
      closeLegend();
    }
  });

  // Trap focus within legend
  legendOverlay.addEventListener("keydown", (e) => {
    if (e.key !== "Tab") return;

    const focusableElements = legendOverlay.querySelectorAll(
      "button, [href], [tabindex]:not([tabindex='-1'])"
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        lastElement.focus();
        e.preventDefault();
      }
    } else {
      if (document.activeElement === lastElement) {
        firstElement.focus();
        e.preventDefault();
      }
    }
  });
}
