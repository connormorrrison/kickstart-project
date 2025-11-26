import { useState, useEffect, type ReactNode } from "react";

interface PopInOutEffectProps {
  children: ReactNode;
  isVisible: boolean;
  className?: string;
  duration?: number;
  delay?: number;
}

export const PopInOutEffect = ({
  children,
  isVisible,
  className = "",
  duration = 200,
  delay = 0
}: PopInOutEffectProps) => {
  const [showElement, setShowElement] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (isVisible && !showElement) {
      // Show with enter animation after delay
      const timer = setTimeout(() => {
        setShowElement(true);
        setIsExiting(false);
      }, delay);
      return () => clearTimeout(timer);
    } else if (!isVisible && showElement) {
      // Hide with exit animation (no delay on exit)
      setIsExiting(true);
      const timer = setTimeout(() => {
        setShowElement(false);
        setIsExiting(false);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, showElement, duration, delay]);

  if (!showElement) return null;

  return (
    <div
      className={`
        ${!isExiting
          ? "animate-in zoom-in-95 fade-in duration-200 ease-out"
          : "animate-out zoom-out-95 fade-out duration-200 ease-in"
        }
        ${className}
      `}
    >
      {children}
    </div>
  );
};
