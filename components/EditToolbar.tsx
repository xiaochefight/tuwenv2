
import React, { useEffect, useState, useRef } from 'react';
import { Bold, Palette, Type, X, ChevronDown } from 'lucide-react';

interface EditToolbarProps {
  activeElement: HTMLElement | null;
  onToggleBold: () => void;
  onSetColor: (color: string) => void;
  onSetFontSize: (size: 'small' | 'default' | 'large' | 'xlarge') => void;
  onClose: () => void;
}

const EditToolbar: React.FC<EditToolbarProps> = ({ 
  activeElement, 
  onToggleBold, 
  onSetColor, 
  onSetFontSize,
  onClose 
}) => {
  const toolbarRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: -100, left: 0 });
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showSizeMenu, setShowSizeMenu] = useState(false);

  useEffect(() => {
    const updatePosition = () => {
      if (!activeElement || !toolbarRef.current) return;
      
      const rect = activeElement.getBoundingClientRect();
      const toolbarRect = toolbarRef.current.getBoundingClientRect();
      const gap = 12;
      
      // Center above the element
      let top = rect.top - toolbarRect.height - gap;
      let left = rect.left + (rect.width / 2) - (toolbarRect.width / 2);

      // Boundary checks
      if (top < gap) {
        top = rect.bottom + gap; // Flip to bottom if not enough space top
      }
      
      if (left < gap) left = gap;
      if (left + toolbarRect.width > window.innerWidth - gap) {
        left = window.innerWidth - toolbarRect.width - gap;
      }

      setPosition({ top, left });
    };

    if (activeElement) {
      updatePosition();
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);
    }

    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [activeElement]);

  // Handle clicking outside to close menus
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (toolbarRef.current && !toolbarRef.current.contains(e.target as Node)) {
        setShowColorPicker(false);
        setShowSizeMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!activeElement) return null;

  const colors = ['#000000', '#FFFFFF', '#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#6366F1', '#8B5CF6', '#EC4899'];
  const sizes: { label: string, value: 'small' | 'default' | 'large' | 'xlarge' }[] = [
    { label: '小', value: 'small' },
    { label: '默认', value: 'default' },
    { label: '大', value: 'large' },
    { label: '特大', value: 'xlarge' },
  ];

  return (
    <div 
      ref={toolbarRef}
      className="fixed z-[9999] flex items-center gap-1 bg-white p-1.5 rounded-lg shadow-xl border border-gray-200 animate-in fade-in zoom-in-95 duration-200"
      style={{ top: position.top, left: position.left }}
      onMouseDown={(e) => e.preventDefault()} // Prevent stealing focus
    >
      {/* Bold */}
      <button 
        onClick={onToggleBold}
        className="p-2 hover:bg-gray-100 rounded-md text-gray-700 transition-colors"
        title="加粗"
      >
        <Bold size={18} />
      </button>

      {/* Font Size */}
      <div className="relative">
        <button 
          onClick={() => { setShowSizeMenu(!showSizeMenu); setShowColorPicker(false); }}
          className={`p-2 hover:bg-gray-100 rounded-md text-gray-700 flex items-center gap-1 transition-colors ${showSizeMenu ? 'bg-gray-100' : ''}`}
          title="字号"
        >
          <Type size={18} />
          <ChevronDown size={12} className="opacity-50" />
        </button>
        {showSizeMenu && (
          <div className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 py-1 min-w-[100px] overflow-hidden">
            {sizes.map((s) => (
              <button
                key={s.value}
                onClick={() => { onSetFontSize(s.value); setShowSizeMenu(false); }}
                className="w-full text-left px-4 py-2 hover:bg-indigo-50 text-sm text-gray-700 hover:text-indigo-600 transition-colors"
              >
                {s.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Color Picker */}
      <div className="relative">
        <button 
          onClick={() => { setShowColorPicker(!showColorPicker); setShowSizeMenu(false); }}
          className={`p-2 hover:bg-gray-100 rounded-md text-gray-700 flex items-center gap-1 transition-colors ${showColorPicker ? 'bg-gray-100' : ''}`}
          title="颜色"
        >
          <Palette size={18} />
          <ChevronDown size={12} className="opacity-50" />
        </button>
        {showColorPicker && (
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 p-2 grid grid-cols-3 gap-1 w-[100px]">
            {colors.map(c => (
              <button
                key={c}
                onClick={() => { onSetColor(c); setShowColorPicker(false); }}
                className="w-6 h-6 rounded-full border border-gray-200 hover:scale-110 transition-transform"
                style={{ backgroundColor: c }}
                title={c}
              />
            ))}
          </div>
        )}
      </div>

      <div className="w-px h-5 bg-gray-200 mx-1"></div>

      {/* Close */}
      <button 
        onClick={onClose}
        className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-md transition-colors"
        title="关闭工具栏"
      >
        <X size={16} />
      </button>
    </div>
  );
};

export default EditToolbar;
