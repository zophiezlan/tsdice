# AI Coding Agent Instructions for tsDice

Welcome to the **tsDice** codebase! This document provides essential guidelines for AI coding agents to be productive and effective contributors to this project. The goal is to ensure that contributions align with the project's architecture, conventions, and workflows.

---

## Project Overview

**tsDice** is a browser-based interactive playground for generating and exploring dynamic particle animations using the [tsParticles](https://github.com/tsparticles/tsparticles) library. The application is designed to:

- Randomly generate particle configurations for creative exploration.
- Allow granular control over particle appearance, movement, and effects.
- Provide features like history, sharing, and intensity scaling.

The project is implemented as a self-contained HTML file (`index.html`) with embedded JavaScript and CSS. It uses ES6 modules to import `tsParticles` functionality.

---

## Key Files

- **`index.html`**: The main entry point containing all application logic, styles, and markup.
- **`README.md`**: Provides a high-level overview of the project, including its purpose, features, and usage instructions.
- **`CONTRIBUTING.md`**: Outlines contribution guidelines for human developers.

---

## Architecture and Patterns

### 1. **Granular Randomization**
- The application categorizes `tsParticles` settings into groups (e.g., Appearance, Movement, Interaction, Special FX).
- Each category has a dedicated generator function (e.g., `generateAppearance()`) that modifies specific parts of the configuration object.

### 2. **Chaos Level Abstraction**
- The "Chaos Level" slider is a custom abstraction that scales multiple random parameters simultaneously (e.g., particle count, speed).
- This abstraction is not part of `tsParticles` but is implemented in the application logic.

### 3. **Configuration Persistence**
- Configurations are serialized into strings for history and sharing.
- The `lz-string` library is used for compressing configurations into URL-safe formats.

---

## Developer Workflows

### Local Development
1. Clone the repository:
   ```bash
   git clone https://github.com/zophiezlan/tsdice.git
   ```
2. Navigate to the project directory:
   ```bash
   cd tsdice
   ```
3. Open `index.html` in a browser. No server setup is required.

### Debugging
- Use browser developer tools to inspect and debug the application.
- The `tsParticles` library provides extensive logging for particle configurations.

### Testing
- There is no automated test suite. Testing is manual and involves verifying the UI and particle animations in the browser.

---

## Project-Specific Conventions

1. **CSS Theming with Variables**
   - The project uses CSS custom properties (`:root`) for theming.
   - Light and dark modes are defined using the `body.light-mode` class.

2. **Glassmorphism Design**
   - UI elements like buttons and modals use glassmorphism styles (e.g., `backdrop-filter`, semi-transparent backgrounds).

3. **Accessibility**
   - Focus indicators and ARIA roles are implemented for better accessibility.
   - Use the `visually-hidden` class for screen-reader-only content.

4. **Responsive Design**
   - The layout adapts to different screen sizes using media queries.

---

## External Dependencies

- **[tsParticles](https://github.com/tsparticles/tsparticles)**: Core library for particle animations.
- **[lz-string](https://github.com/pieroxy/lz-string)**: Used for compressing configuration strings.

---

## Examples

### Adding a New Shuffle Category
To add a new shuffle category (e.g., "Physics"):
1. Define a new generator function (e.g., `generatePhysics()`).
2. Update the `sub-menu` in `index.html` to include a button for the new category.
3. Bind the button to the generator function in the JavaScript logic.

### Modifying the Chaos Slider
To change the behavior of the "Chaos Level" slider:
1. Locate the slider logic in the JavaScript section of `index.html`.
2. Adjust the scaling factors applied to random parameters.

---

## Contribution Guidelines

- Follow the existing code style and patterns.
- Ensure all new features are manually tested in the browser.
- Update the `README.md` and this document for any significant changes.

---

For further questions, refer to the `README.md` or open an issue in the repository.