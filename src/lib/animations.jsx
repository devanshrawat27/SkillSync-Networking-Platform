import { motion } from 'framer-motion';

/**
 * Fade in and slide up animation
 */
export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 },
  transition: { duration: 0.6, ease: 'easeOut' }
};

/**
 * Fade in animation
 */
export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 0.5 }
};

/**
 * Stagger container
 */
export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

/**
 * Scale and fade animation for cards
 */
export const scaleIn = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.5, ease: 'easeOut' }
};

/**
 * Hover lift effect
 */
export const hoverLift = {
  whileHover: { y: -8, transition: { duration: 0.3 } },
  whileTap: { scale: 0.98 }
};

/**
 * Glow effect on hover
 */
export const glowEffect = {
  whileHover: {
    boxShadow: '0 0 30px rgba(124, 58, 237, 0.4)',
    transition: { duration: 0.3 }
  }
};

/**
 * Page transition
 */
export const pageTransition = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: { duration: 0.3 }
};

/**
 * Reusable animated container
 */
export function AnimatedContainer({ children, variants = fadeInUp, ...props }) {
  return (
    <motion.div initial={variants.initial} animate={variants.animate} transition={variants.transition} {...props}>
      {children}
    </motion.div>
  );
}

/**
 * Animated button with ripple effect
 */
export function AnimatedButton({ children, ...props }) {
  return (
    <motion.button {...hoverLift} whileTap={{ scale: 0.95 }} {...props}>
      {children}
    </motion.button>
  );
}
