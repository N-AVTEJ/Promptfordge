import { type Variants, type Transition } from "framer-motion";

/**
 * PromptForge Central Motion Design System
 * Rule: Animate ONLY transform and opacity. Target 60fps.
 * No layout-thrashing animations. No magic numbers.
 */

export const durations = {
  instant: 0.05,
  fast: 0.15,
  normal: 0.25,
  medium: 0.35,
  slow: 0.5,
  relaxed: 0.75,
} as const;

export const easings = {
  // Signature forge curve: responsive, snappy start with smooth deceleration
  forge: [0.22, 1, 0.36, 1] as [number, number, number, number],
  easeOut: [0.16, 1, 0.3, 1] as [number, number, number, number],
  easeInOut: [0.65, 0, 0.35, 1] as [number, number, number, number],
  snappy: [0.4, 0, 0.2, 1] as [number, number, number, number],
} as const;

export const gsapEasings = {
  forge: "cubic-bezier(0.22, 1, 0.36, 1)",
  easeOut: "cubic-bezier(0.16, 1, 0.3, 1)",
  easeInOut: "cubic-bezier(0.65, 0, 0.35, 1)",
  snappy: "cubic-bezier(0.4, 0, 0.2, 1)",
} as const;

export const transitions = {
  default: {
    duration: durations.normal,
    ease: easings.forge,
  } satisfies Transition,
  fast: {
    duration: durations.fast,
    ease: easings.easeOut,
  } satisfies Transition,
  slow: {
    duration: durations.slow,
    ease: easings.forge,
  } satisfies Transition,
  relaxed: {
    duration: durations.relaxed,
    ease: easings.forge,
  } satisfies Transition,
  instant: {
    duration: durations.instant,
  } satisfies Transition,
} as const;

/**
 * Helper to produce variants that completely strip transforms when reduced motion is preferred.
 */
export function createReducedMotionVariant(
  standard: Variants,
  reducedFallback: Variants
): (prefersReducedMotion: boolean) => Variants {
  return (prefersReducedMotion: boolean) =>
    prefersReducedMotion ? reducedFallback : standard;
}

/**
 * Standard Fade-Up variant: subtle 16px translation and opacity.
 */
export const fadeUpVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 16,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: transitions.default,
  },
};

export const fadeUpReducedVariants: Variants = {
  hidden: {
    opacity: 1,
    y: 0,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0 },
  },
};

/**
 * Scale-In variant: subtle scale from 0.96 to 1.0 with opacity.
 */
export const scaleInVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.96,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: transitions.default,
  },
};

export const scaleInReducedVariants: Variants = {
  hidden: {
    opacity: 1,
    scale: 1,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0 },
  },
};

/**
 * Pure Fade-In variant.
 */
export const fadeInVariants: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: transitions.fast,
  },
};

/**
 * Stagger container generator.
 */
export function getStaggerContainerVariants(
  staggerDelay = 0.08,
  delayChildren = 0.04
): Variants {
  return {
    hidden: {
      opacity: 0,
    },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren,
      },
    },
  };
}

export const staggerContainerVariants: Variants = getStaggerContainerVariants();

/**
 * Drawer / Modal backdrop variants
 */
export const backdropVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: durations.fast, ease: easings.easeOut },
  },
  exit: {
    opacity: 0,
    transition: { duration: durations.fast, ease: easings.easeOut },
  },
};

export const backdropReducedVariants: Variants = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: { duration: 0 },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0 },
  },
};

/**
 * Mobile drawer content variant (slides in from right/top)
 */
export const drawerVariants: Variants = {
  hidden: {
    opacity: 0,
    x: "100%",
  },
  visible: {
    opacity: 1,
    x: "0%",
    transition: {
      duration: durations.medium,
      ease: easings.forge,
    },
  },
  exit: {
    opacity: 0,
    x: "100%",
    transition: {
      duration: durations.fast,
      ease: easings.easeOut,
    },
  },
};

export const drawerReducedVariants: Variants = {
  hidden: {
    opacity: 1,
    x: "0%",
  },
  visible: {
    opacity: 1,
    x: "0%",
    transition: { duration: 0 },
  },
  exit: {
    opacity: 0,
    x: "0%",
    transition: { duration: 0 },
  },
};
