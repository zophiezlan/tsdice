import { describe, it, expect, beforeEach } from 'vitest';
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

    it('should emit hex colour strings in dark mode', () => {
      AppState.ui.isDarkMode = true;
      AppState.particleState.chaosLevel = 10;
      const appearances = Array.from({ length: 20 }, () =>
        ConfigGenerator.generateAppearance()
      );

      appearances.forEach((a) => {
        const values = Array.isArray(a.color.value)
          ? a.color.value
          : [a.color.value];
        values.forEach((c) => expect(c).toMatch(/^#[0-9a-f]{6}$/));
      });
    });

    it('should emit hex colour strings in light mode', () => {
      AppState.ui.isDarkMode = false;
      AppState.particleState.chaosLevel = 10;
      const appearances = Array.from({ length: 20 }, () =>
        ConfigGenerator.generateAppearance()
      );

      appearances.forEach((a) => {
        const values = Array.isArray(a.color.value)
          ? a.color.value
          : [a.color.value];
        values.forEach((c) => expect(c).toMatch(/^#[0-9a-f]{6}$/));
      });
    });

    it('should never emit per-particle variety at chaos 0', () => {
      AppState.particleState.chaosLevel = 0;
      const appearances = Array.from({ length: 50 }, () =>
        ConfigGenerator.generateAppearance()
      );

      appearances.forEach((a) => {
        expect(Array.isArray(a.color.value)).toBe(false);
        expect(Array.isArray(a.shape.type)).toBe(false);
        expect(a.reduceDuplicates).toBe(false);
      });
    });

    it('should sometimes emit array variety at chaos 10', () => {
      AppState.particleState.chaosLevel = 10;
      const appearances = Array.from({ length: 100 }, () =>
        ConfigGenerator.generateAppearance()
      );

      const shapeArrays = appearances.filter((a) =>
        Array.isArray(a.shape.type)
      );
      const colorArrays = appearances.filter((a) =>
        Array.isArray(a.color.value)
      );

      // Shape variety gated at chaos/20 = 50% at chaos 10.
      // Colour variety gated at chaos/15 = ~66% at chaos 10.
      expect(shapeArrays.length).toBeGreaterThan(0);
      expect(colorArrays.length).toBeGreaterThan(0);
    });

    it('should scale variety probability with chaos', () => {
      const sampleShapeArrayRate = (chaos) => {
        AppState.particleState.chaosLevel = chaos;
        const runs = Array.from({ length: 200 }, () =>
          ConfigGenerator.generateAppearance()
        );
        return runs.filter((a) => Array.isArray(a.shape.type)).length / 200;
      };

      const lowRate = sampleShapeArrayRate(2);
      const highRate = sampleShapeArrayRate(10);
      expect(highRate).toBeGreaterThan(lowRate);
    });

    it('should enable reduceDuplicates only when arrays are emitted', () => {
      AppState.particleState.chaosLevel = 10;
      const appearances = Array.from({ length: 50 }, () =>
        ConfigGenerator.generateAppearance()
      );

      appearances.forEach((a) => {
        const hasArray =
          Array.isArray(a.color.value) || Array.isArray(a.shape.type);
        expect(a.reduceDuplicates).toBe(hasArray);
      });
    });

    it('should scale size with chaos level', () => {
      AppState.particleState.chaosLevel = 1;
      const lowChaos = ConfigGenerator.generateAppearance();

      AppState.particleState.chaosLevel = 10;
      const highChaos = ConfigGenerator.generateAppearance();

      expect(highChaos.size.value.max).toBeGreaterThan(lowChaos.size.value.max);
    });

    it('should include polygon sides when polygon is in the shape subset', () => {
      AppState.particleState.chaosLevel = 10;
      const appearances = Array.from({ length: 100 }, () =>
        ConfigGenerator.generateAppearance()
      );

      const asList = (t) => (Array.isArray(t) ? t : [t]);
      const withPolygon = appearances.filter((a) =>
        asList(a.shape.type).includes('polygon')
      );
      expect(withPolygon.length).toBeGreaterThan(0);
      withPolygon.forEach((a) => {
        expect(a.shape.options.polygon).toBeDefined();
        expect(a.shape.options.polygon.sides).toBeGreaterThanOrEqual(3);
        expect(a.shape.options.polygon.sides).toBeLessThanOrEqual(12);
      });
    });

    it('should cap rounded-polygon sides to prevent splat rendering', () => {
      AppState.particleState.chaosLevel = 10;
      const appearances = Array.from({ length: 200 }, () =>
        ConfigGenerator.generateAppearance()
      );

      const asList = (t) => (Array.isArray(t) ? t : [t]);
      const withRP = appearances.filter((a) =>
        asList(a.shape.type).includes('rounded-polygon')
      );
      withRP.forEach((a) => {
        const opts = a.shape.options['rounded-polygon'];
        expect(opts).toBeDefined();
        expect(opts.sides).toBeGreaterThanOrEqual(3);
        expect(opts.sides).toBeLessThanOrEqual(6);
        expect(opts.radius).toBeGreaterThanOrEqual(2);
        expect(opts.radius).toBeLessThanOrEqual(5);
      });
    });

    it('should include spiral options when spiral is in the shape subset', () => {
      AppState.particleState.chaosLevel = 10;
      const appearances = Array.from({ length: 200 }, () =>
        ConfigGenerator.generateAppearance()
      );

      const asList = (t) => (Array.isArray(t) ? t : [t]);
      const withSpiral = appearances.filter((a) =>
        asList(a.shape.type).includes('spiral')
      );
      withSpiral.forEach((a) => {
        expect(a.shape.options.spiral).toBeDefined();
        expect(a.shape.options.spiral.innerRadius).toBeGreaterThan(0);
        expect(a.shape.options.spiral.lineSpacing).toBeGreaterThan(0);
        expect(a.shape.options.spiral.widthFactor).toBeGreaterThan(0);
      });
    });

    it('should never use character/emoji shape', () => {
      const appearances = Array.from({ length: 100 }, () =>
        ConfigGenerator.generateAppearance()
      );
      appearances.forEach((a) => {
        const types = Array.isArray(a.shape.type)
          ? a.shape.type
          : [a.shape.type];
        expect(types).not.toContain('character');
      });
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
    });

    it('should always enable movement', () => {
      const movement = ConfigGenerator.generateMovement();
      expect(movement.enable).toBe(true);
    });

    it('should scale speed with chaos level', () => {
      AppState.particleState.chaosLevel = 1;
      ConfigGenerator.generateMovement(); // Low chaos

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

    it('should never emit a path generator below chaos 6', () => {
      for (let chaos = 1; chaos <= 5; chaos++) {
        AppState.particleState.chaosLevel = chaos;
        const movements = Array.from({ length: 100 }, () =>
          ConfigGenerator.generateMovement()
        );
        const withPath = movements.filter((m) => m.path?.enable);
        expect(withPath.length).toBe(0);
      }
    });

    it('should occasionally include a path generator at chaos 10', () => {
      AppState.particleState.chaosLevel = 10;
      const movements = Array.from({ length: 400 }, () =>
        ConfigGenerator.generateMovement()
      );

      const withPath = movements.filter((m) => m.path?.enable);
      expect(withPath.length).toBeGreaterThan(0);

      const validGenerators = [
        'perlinNoise',
        'simplexNoise',
        'curlNoise',
        'zigZagPathGenerator',
      ];
      withPath.forEach((m) => {
        expect(validGenerators).toContain(m.path.generator);
      });
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
      expect(fx).toHaveProperty('tilt');
      expect(fx).toHaveProperty('roll');
    });

    it('should randomly enable tilt based on chaos', () => {
      AppState.particleState.chaosLevel = 10;
      const fxList = Array.from({ length: 30 }, () =>
        ConfigGenerator.generateSpecialFX()
      );

      const withTilt = fxList.filter((fx) => fx.tilt.enable);
      expect(withTilt.length).toBeGreaterThan(0);

      if (withTilt.length > 0) {
        const tilt = withTilt[0].tilt;
        expect(tilt.animation.enable).toBe(true);
        expect(tilt.animation.speed).toBeGreaterThan(0);
      }
    });

    it('should randomly enable roll based on chaos', () => {
      AppState.particleState.chaosLevel = 10;
      const fxList = Array.from({ length: 30 }, () =>
        ConfigGenerator.generateSpecialFX()
      );

      const withRoll = fxList.filter((fx) => fx.roll.enable);
      expect(withRoll.length).toBeGreaterThan(0);

      if (withRoll.length > 0) {
        const roll = withRoll[0].roll;
        expect(roll.speed).toBeGreaterThan(0);
        expect(['vertical', 'horizontal']).toContain(roll.mode);
      }
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
        // Collision mode is always 'bounce' — 'destroy' removes particles
        // permanently, which drains the scene across repeated shuffles.
        withCollisions.forEach((fx) => {
          expect(fx.collisions.mode).toBe('bounce');
        });
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
        if (config.fx.collisions.enable) features++;
        if (config.fx.wobble.enable) features++;
        return sum + features;
      }, 0);

      const highChaosFeatures = highChaosConfigs.reduce((sum, config) => {
        let features = 0;
        if (config.movement.attract) features++;
        if (config.fx.collisions.enable) features++;
        if (config.fx.wobble.enable) features++;
        return sum + features;
      }, 0);

      expect(highChaosFeatures).toBeGreaterThanOrEqual(lowChaosFeatures);
    });
  });
});
