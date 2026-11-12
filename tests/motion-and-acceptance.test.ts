import { describe, it } from "node:test";
import assert from "node:assert";
import {
  durations,
  easings,
  gsapEasings,
  fadeUpVariants,
  fadeUpReducedVariants,
  scaleInVariants,
  scaleInReducedVariants,
  drawerVariants,
  drawerReducedVariants,
  backdropVariants,
  backdropReducedVariants,
  createReducedMotionVariant,
} from "../lib/motion/index";

describe("PromptForge Motion Primitives & Reduced Motion Rules", () => {
  it("enforces centralized durations with no magic numbers", () => {
    assert.strictEqual(durations.instant, 0.05);
    assert.strictEqual(durations.fast, 0.15);
    assert.strictEqual(durations.normal, 0.25);
    assert.strictEqual(durations.medium, 0.35);
    assert.strictEqual(durations.slow, 0.5);
    assert.strictEqual(durations.relaxed, 0.75);
  });

  it("enforces cubic-bezier forge easings", () => {
    assert.deepStrictEqual(easings.forge, [0.22, 1, 0.36, 1]);
    assert.deepStrictEqual(easings.easeOut, [0.16, 1, 0.3, 1]);
    assert.strictEqual(gsapEasings.forge, "cubic-bezier(0.22, 1, 0.36, 1)");
  });

  it("ensures fadeUpVariants animates only opacity and transform", () => {
    const hidden = fadeUpVariants.hidden as Record<string, unknown>;
    const visible = fadeUpVariants.visible as Record<string, unknown>;

    assert.strictEqual(hidden.opacity, 0);
    assert.strictEqual(hidden.y, 16);
    assert.strictEqual(visible.opacity, 1);
    assert.strictEqual(visible.y, 0);
  });

  it("ensures reduced-motion fallback disables translation transforms and sets duration to 0", () => {
    const hidden = fadeUpReducedVariants.hidden as Record<string, unknown>;
    const visible = fadeUpReducedVariants.visible as Record<string, unknown>;
    const transition = visible.transition as Record<string, unknown>;

    assert.strictEqual(hidden.y, 0);
    assert.strictEqual(visible.y, 0);
    assert.strictEqual(hidden.opacity, 1);
    assert.strictEqual(visible.opacity, 1);
    assert.strictEqual(transition.duration, 0);
  });

  it("ensures scaleIn reduced-motion fallback disables scale transforms and sets duration to 0", () => {
    const hidden = scaleInReducedVariants.hidden as Record<string, unknown>;
    const visible = scaleInReducedVariants.visible as Record<string, unknown>;
    const transition = visible.transition as Record<string, unknown>;

    assert.strictEqual(hidden.scale, 1);
    assert.strictEqual(visible.scale, 1);
    assert.strictEqual(hidden.opacity, 1);
    assert.strictEqual(visible.opacity, 1);
    assert.strictEqual(transition.duration, 0);
  });

  it("ensures drawer reduced-motion fallback strips slide transforms and sets duration to 0", () => {
    const hidden = drawerReducedVariants.hidden as Record<string, unknown>;
    const visible = drawerReducedVariants.visible as Record<string, unknown>;
    const transition = visible.transition as Record<string, unknown>;

    assert.strictEqual(hidden.x, "0%");
    assert.strictEqual(visible.x, "0%");
    assert.strictEqual(hidden.opacity, 1);
    assert.strictEqual(visible.opacity, 1);
    assert.strictEqual(transition.duration, 0);
  });

  it("ensures backdrop reduced-motion fallback sets duration to 0", () => {
    const hidden = backdropReducedVariants.hidden as Record<string, unknown>;
    const visible = backdropReducedVariants.visible as Record<string, unknown>;
    const transition = visible.transition as Record<string, unknown>;

    assert.strictEqual(hidden.opacity, 1);
    assert.strictEqual(visible.opacity, 1);
    assert.strictEqual(transition.duration, 0);
  });

  it("createReducedMotionVariant switches between standard and fallback correctly", () => {
    const selector = createReducedMotionVariant(
      fadeUpVariants,
      fadeUpReducedVariants
    );

    assert.strictEqual(selector(false), fadeUpVariants);
    assert.strictEqual(selector(true), fadeUpReducedVariants);
  });
});
