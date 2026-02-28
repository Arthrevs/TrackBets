import React, { useRef, useState } from 'react';
import { motion, useSpring, useMotionValue, useTransform } from 'framer-motion';

const MagneticButton = ({ children, className = "", strength = 20 }) => {
    const ref = useRef(null);

    // Motion values for X and Y position
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    // Smooth spring physics for the "magnetic" return (increased damping for less bounciness)
    const springConfig = { damping: 20, stiffness: 120, restDelta: 0.001 };
    const xSpring = useSpring(x, springConfig);
    const ySpring = useSpring(y, springConfig);

    const [isHovered, setIsHovered] = useState(false);

    const handleMouseMove = (e) => {
        const { clientX, clientY } = e;
        const { left, top, width, height } = ref.current.getBoundingClientRect();

        // Calculate distance from center of the button
        const centerX = left + width / 2;
        const centerY = top + height / 2;

        // Offset from center - Movement reduced by 40%
        const offsetX = (clientX - centerX) * (strength / 100) * 0.6;
        const offsetY = (clientY - centerY) * (strength / 100) * 0.6;

        x.set(offsetX);
        y.set(offsetY);
    };

    const handleMouseEnter = () => setIsHovered(true);
    const handleMouseLeave = () => {
        setIsHovered(false);
        x.set(0);
        y.set(0);
    };

    return (
        <motion.div
            ref={ref}
            className={`magnetic-wrap ${className}`}
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            style={{
                x: xSpring,
                y: ySpring,
                position: 'relative',
                display: 'inline-block'
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 280, damping: 18 }}
        >
            {children}
        </motion.div>
    );
};

export default MagneticButton;
