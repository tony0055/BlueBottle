import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface ButtonProps extends HTMLMotionProps<"button"> {
  variant?: 'primary' | 'secondary' | 'ghost';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  fullWidth = false,
  className = '',
  ...props 
}) => {
  
  // Tech/Lab Aesthetic: Slightly rounded corners (rounded-lg) to soften the brutalism
  const baseStyles = "inline-flex items-center justify-center font-mono text-xs uppercase tracking-widest transition-all focus:outline-none border rounded-lg";
  
  const variants = {
    primary: "bg-lab-blue text-white border-lab-blue hover:bg-blue-600 shadow-md",
    secondary: "bg-transparent text-lab-black border-lab-black hover:bg-lab-black hover:text-white",
    ghost: "bg-transparent text-lab-black border-transparent hover:bg-black/5"
  };

  const sizing = "py-4 px-6";

  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      className={`
        ${baseStyles} 
        ${sizing} 
        ${variants[variant]} 
        ${fullWidth ? 'w-full' : ''} 
        ${className}
      `}
      {...props}
    >
      {children}
    </motion.button>
  );
};