
import { useState, useCallback } from 'react';

export const useInlineEditor = () => {
  const [activeElement, setActiveElement] = useState<HTMLElement | null>(null);

  const executeCommand = useCallback((command: string, value?: string) => {
    if (!activeElement) return;
    
    // Restore focus to ensure command applies to the correct selection
    activeElement.focus();
    
    // Execute the command
    document.execCommand(command, false, value);
    
    // Dispatch input event to trigger React state updates in the bound component
    activeElement.dispatchEvent(new Event('input', { bubbles: true }));
  }, [activeElement]);

  const toggleBold = () => executeCommand('bold');
  
  const setTextColor = (color: string) => executeCommand('foreColor', color);
  
  const setFontSize = (size: 'small' | 'default' | 'large' | 'xlarge') => {
    // Mapping to legacy font size (1-7) for broad compatibility in contentEditable
    // 2=small(13px), 3=normal(16px), 5=large(24px), 6=xlarge(32px)
    const map = {
      small: '2',
      default: '3',
      large: '5',
      xlarge: '6'
    };
    executeCommand('fontSize', map[size]);
  };

  return {
    activeElement,
    setActiveElement,
    toggleBold,
    setTextColor,
    setFontSize
  };
};
