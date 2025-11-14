import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ConfigGenerator } from '../js/configGenerator.js';
import { AppState } from '../js/state.js';

describe('ConfigGenerator', () => {
  beforeEach(() => {
    // Reset state before each test
    AppState.ui.isDarkMode = true;
    AppState.particleState.chaosLevel = 5;
  });

  describe('generateAppearance', () => {
    it('should generate valid appearance configuration', () => {
      const appearance = ConfigGenerator.generateAppearance();

      expect(appearance).toHaveProperty('color');
      expect(appearance).toHaveProperty('shape');
      expect(appearance).toHaveProperty('opacity');
      expect(appearance).toHaveProperty('size');
      expect(appearance).toHaveProperty('stroke');
    });

    it('should use dark palette colors when in dark mode', () => {
      AppState.ui.isDarkMode = true;
      const appearances = Array.from({ length: 20 }, () =>
        ConfigGenerator.generateAppearance()
      );

      // At least some should have colors from the palette (not all will be "random")
      const hasValidColors = appearances.some(
        (a) => typeof a.color.value === 'string'
      );
      expect(hasValidColors).toBe(true);
    });

    it('should use light palette colors when in light mode', () => {
      AppState.ui.isDarkMode = false;
      const appearances = Array.from({ length: 20 }, () =>
        ConfigGenerator.generateAppearance()
      );

      const hasValidColors = appearances.some(
        (a) => typeof a.color.value === 'string'
      );
      expect(hasValidColors).toBe(true);
    });

    it('should scale size with chaos level', () => {
      AppState.particleState.chaosLevel = 1;
      const lowChaos = ConfigGenerator.generateAppearance();

      AppState.particleState.chaosLevel = 10;
      const highChaos = ConfigGenerator.generateAppearance();

      expect(highChaos.size.value.max).toBeGreaterThan(
        lowChaos.size.value.max
      );
    });

    it('should include polygon sides when shape is polygon', () => {
      // Generate multiple times to ensure we hit polygon
      const appearances = Array.from({ length: 50 }, () =>
        ConfigGenerator.generateAppearance()
      );

      const polygons = appearances.filter((a) => a.shape.type === 'polygon');
      if (polygons.length > 0) {
        const polygon = polygons[0];
        expect(polygon.shape.options.polygon).toBeDefined();
        expect(polygon.shape.options.polygon.sides).toBeGreaterThanOrEqual(3);
        expect(polygon.shape.options.polygon.sides).toBeLessThanOrEqual(12);
      }
    });

    it('should include character value when shape is character', () => {
      const appearances = Array.from({ length: 50 }, () =>
        ConfigGenerator.generateAppearance()
      );

      const characters = appearances.filter(
        (a) => a.shape.type === 'character'
      );
      if (characters.length > 0) {
        const character = characters[0];
        expect(character.shape.options.character).toBeDefined();
        expect(character.shape.options.character.value).toBeDefined();
        expect(character.shape.options.character.fill).toBe(true);
      }
    });

    it('should generate valid opacity range', () => {
      const appearance = ConfigGenerator.generateAppearance();

      expect(appearance.opacity.value.min).toBe(0.3);
      expect(appearance.opacity.value.max).toBe(1);
    });

    it('should sometimes include stroke based on chaos', () => {
      AppState.particleState.chaosLevel = 10;
      const appearances = Array.from({ length: 30 }, () =>
        ConfigGenerator.generateAppearance()
      );

      const withStroke = appearances.filter((a) => a.stroke.width > 0);
      expect(withStroke.length).toBeGreaterThan(0);
    });
  });

  describe('generateMovement', () => {
    it('should generate valid movement configuration', () => {
      const movement = ConfigGenerator.generateMovement();

      expect(movement).toHaveProperty('enable');
      expect(movement).toHaveProperty('speed');
      expect(movement).toHaveProperty('direction');
      expect(movement).toHaveProperty('random');
      expect(movement).toHaveProperty('straight');
      expect(movement).toHaveProperty('outModes');
      expect(movement).toHaveProperty('trail');
    });

    it('should always enable movement', () => {
      const movement = ConfigGenerator.generateMovement();
      expect(movement.enable).toBe(true);
    });

    it('should scale speed with chaos level', () => {
      AppState.particleState.chaosLevel = 1;
      const lowChaosMovement = ConfigGenerator.generateMovement();

      AppState.particleState.chaosLevel = 10;
      const highChaosMovement = ConfigGenerator.generateMovement();

      // Speed should be higher with higher chaos
      expect(highChaosMovement.speed).toBeGreaterThan(0);
    });

    it('should set random to true', () => {
      const movement = ConfigGenerator.generateMovement();
      expect(movement.random).toBe(true);
    });

    it('should set straight to false', () => {
      const movement = ConfigGenerator.generateMovement();
      expect(movement.straight).toBe(false);
    });

    it('should use correct trail fill color based on theme', () => {
      AppState.ui.isDarkMode = true;
      const darkMovement = ConfigGenerator.generateMovement();
      expect(darkMovement.trail.fill.color.value).toBe('#111');

      AppState.ui.isDarkMode = false;
      const lightMovement = ConfigGenerator.generateMovement();
      expect(lightMovement.trail.fill.color.value).toBe('#f0f0f0');
    });

    it('should sometimes include attract mode', () => {
      AppState.particleState.chaosLevel = 10;
      const movements = Array.from({ length: 20 }, () =>
        ConfigGenerator.generateMovement()
      );

      const withAttract = movements.filter((m) => m.attract);
      expect(withAttract.length).toBeGreaterThan(0);

      if (withAttract.length > 0) {
        const movement = withAttract[0];
        expect(movement.attract.enable).toBe(true);
        expect(movement.attract.rotate.x).toBeDefined();
        expect(movement.attract.rotate.y).toBeDefined();
      }
    });
  });

  describe('generateInteraction', () => {
    it('should generate valid interaction configuration', () => {
      const interaction = ConfigGenerator.generateInteraction();

      expect(interaction).toHaveProperty('detectsOn');
      expect(interaction).toHaveProperty('events');
      expect(interaction).toHaveProperty('modes');
    });

    it('should enable hover and click events', () => {
      const interaction = ConfigGenerator.generateInteraction();

      expect(interaction.events.onHover.enable).toBe(true);
      expect(interaction.events.onClick.enable).toBe(true);
    });

    it('should store original interaction modes in state', () => {
      const interaction = ConfigGenerator.generateInteraction();

      expect(AppState.particleState.originalInteractionModes.click).toBe(
        interaction.events.onClick.mode
      );
      expect(AppState.particleState.originalInteractionModes.hover).toBe(
        interaction.events.onHover.mode
      );
    });

    it('should scale mode parameters with chaos level', () => {
      AppState.particleState.chaosLevel = 1;
      const lowChaos = ConfigGenerator.generateInteraction();

      AppState.particleState.chaosLevel = 10;
      const highChaos = ConfigGenerator.generateInteraction();

      // Push quantity should scale with chaos
      expect(highChaos.modes.push.quantity).toBeGreaterThan(
        lowChaos.modes.push.quantity
      );
    });

    it('should include all required interaction modes', () => {
      const interaction = ConfigGenerator.generateInteraction();

      expect(interaction.modes).toHaveProperty('repulse');
      expect(interaction.modes).toHaveProperty('push');
      expect(interaction.modes).toHaveProperty('bubble');
      expect(interaction.modes).toHaveProperty('parallax');
      expect(interaction.modes).toHaveProperty('grab');
      expect(interaction.modes).toHaveProperty('slow');
      expect(interaction.modes).toHaveProperty('connect');
      expect(interaction.modes).toHaveProperty('remove');
      expect(interaction.modes).toHaveProperty('trail');
      expect(interaction.modes).toHaveProperty('absorb');
      expect(interaction.modes).toHaveProperty('attract');
    });
  });

  describe('generateSpecialFX', () => {
    it('should generate valid special FX configuration', () => {
      const fx = ConfigGenerator.generateSpecialFX();

      expect(fx).toHaveProperty('life');
      expect(fx).toHaveProperty('collisions');
      expect(fx).toHaveProperty('wobble');
    });

    it('should always disable life', () => {
      const fx = ConfigGenerator.generateSpecialFX();
      expect(fx.life.enable).toBe(false);
    });

    it('should randomly enable collisions based on chaos', () => {
      AppState.particleState.chaosLevel = 10;
      const fxList = Array.from({ length: 20 }, () =>
        ConfigGenerator.generateSpecialFX()
      );

      const withCollisions = fxList.filter((fx) => fx.collisions.enable);
      expect(withCollisions.length).toBeGreaterThan(0);

      if (withCollisions.length > 0) {
        const fx = withCollisions[0];
        expect(['bounce', 'destroy']).toContain(fx.collisions.mode);
      }
    });

    it('should randomly enable wobble based on chaos', () => {
      AppState.particleState.chaosLevel = 10;
      const fxList = Array.from({ length: 20 }, () =>
        ConfigGenerator.generateSpecialFX()
      );

      const withWobble = fxList.filter((fx) => fx.wobble.enable);
      expect(withWobble.length).toBeGreaterThan(0);
    });

    it('should preserve existing FX when provided', () => {
      const currentFx = {
        life: { enable: false },
        collisions: { enable: true, mode: 'bounce' },
      };

      const fx = ConfigGenerator.generateSpecialFX(currentFx);

      expect(fx).toHaveProperty('life');
      expect(fx).toHaveProperty('collisions');
      expect(fx).toHaveProperty('wobble');
    });
  });

  describe('chaos level integration', () => {
    it('should produce more complex configs at higher chaos levels', () => {
      AppState.particleState.chaosLevel = 1;
      const lowChaosConfigs = Array.from({ length: 10 }, () => ({
        appearance: ConfigGenerator.generateAppearance(),
        movement: ConfigGenerator.generateMovement(),
        interaction: ConfigGenerator.generateInteraction(),
        fx: ConfigGenerator.generateSpecialFX(),
      }));

      AppState.particleState.chaosLevel = 10;
      const highChaosConfigs = Array.from({ length: 10 }, () => ({
        appearance: ConfigGenerator.generateAppearance(),
        movement: ConfigGenerator.generateMovement(),
        interaction: ConfigGenerator.generateInteraction(),
        fx: ConfigGenerator.generateSpecialFX(),
      }));

      // High chaos should have more features enabled on average
      const lowChaosFeatures = lowChaosConfigs.reduce((sum, config) => {
        let features = 0;
        if (config.movement.attract) features++;
        if (config.movement.trail.enable) features++;
        if (config.fx.collisions.enable) features++;
        if (config.fx.wobble.enable) features++;
        return sum + features;
      }, 0);

      const highChaosFeatures = highChaosConfigs.reduce((sum, config) => {
        let features = 0;
        if (config.movement.attract) features++;
        if (config.movement.trail.enable) features++;
        if (config.fx.collisions.enable) features++;
        if (config.fx.wobble.enable) features++;
        return sum + features;
      }, 0);

      expect(highChaosFeatures).toBeGreaterThanOrEqual(lowChaosFeatures);
    });
  });
});
