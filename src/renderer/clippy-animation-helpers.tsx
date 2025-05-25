import { ANIMATIONS, Animation } from "./clippy-animations";

export const ANIMATION_KEYS = Object.keys(ANIMATIONS);
export const ANIMATION_KEYS_BRACKETS = ANIMATION_KEYS.map((k) => `[${k}]`);
export const IDLE_ANIMATION_KEYS = ANIMATION_KEYS.filter((k) =>
  k.startsWith("Idle"),
);

export const EMPTY_ANIMATION: Animation = {
  src: `data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==`,
  length: 0,
};

/**
 * Get a random animation from the given keys'
 *
 * @param keys - The keys of the animations to choose from
 * @param current - The current animation
 * @returns A random animation from the given keys
 */
export function getRandomAnimation(keys: string[], current?: Animation) {
  const randomIndex = Math.floor(Math.random() * keys.length);
  const randomAnimationKey = keys[randomIndex] as keyof typeof ANIMATIONS;
  const animation = ANIMATIONS[randomAnimationKey];

  // If the random animation is the same as the current animation, get a new random animation
  if (current && animation === current) {
    return getRandomAnimation(keys, current);
  }

  return animation;
}

/**
 * Get a random idle animation
 *
 * @param current - The current animation
 * @returns A random idle animation
 */
export function getRandomIdleAnimation(current?: Animation) {
  return getRandomAnimation(IDLE_ANIMATION_KEYS, current);
}
