/**
 * @description The single source of truth for the entire application.
 * Divided into namespaces for clarity and organization.
 */
export const AppState = {
    ui: {
        isDarkMode: true,
        isCursorParticle: false,
        isGravityOn: false,
        areWallsOn: false,
        isPaused: false,
        lastFocusedElement: null,
        particlesContainer: null,
    },
    particleState: {
        chaosLevel: 5,
        currentConfig: {},
        originalInteractionModes: {},
        originalOutModes: {},
        initialConfigFromUrl: null,
    }
};
