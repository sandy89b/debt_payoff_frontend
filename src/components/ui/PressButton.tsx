import React, { useState } from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface PressButtonProps extends ButtonProps {
  // All ButtonProps are inherited
}

export const PressButton = React.forwardRef<HTMLButtonElement, PressButtonProps>(
  ({ className, onMouseDown, onMouseUp, onMouseLeave, onTouchStart, onTouchEnd, onTouchCancel, ...props }, ref) => {
    const [isPressed, setIsPressed] = useState(false);

    const handleMouseDown = (e: React.MouseEvent<HTMLButtonElement>) => {
      setIsPressed(true);
      onMouseDown?.(e);
    };

    const handleMouseUp = (e: React.MouseEvent<HTMLButtonElement>) => {
      setIsPressed(false);
      onMouseUp?.(e);
    };

    const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
      setIsPressed(false);
      onMouseLeave?.(e);
    };

    const handleTouchStart = (e: React.TouchEvent<HTMLButtonElement>) => {
      setIsPressed(true);
      onTouchStart?.(e);
    };

    const handleTouchEnd = (e: React.TouchEvent<HTMLButtonElement>) => {
      setIsPressed(false);
      onTouchEnd?.(e);
    };

    const handleTouchCancel = (e: React.TouchEvent<HTMLButtonElement>) => {
      setIsPressed(false);
      onTouchCancel?.(e);
    };

    return (
      <Button
        ref={ref}
        className={cn(
          'transition-all duration-150 ease-out transform active:scale-95',
          isPressed && 'scale-95 shadow-inner',
          className
        )}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchCancel}
        {...props}
      />
    );
  }
);

PressButton.displayName = "PressButton";
