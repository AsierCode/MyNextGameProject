import React, { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon } from '../constants';

interface FilterItem {
  id: number | string;
  name: string;
  slug?: string; 
}

interface FilterDropdownProps {
  items: FilterItem[];
  selectedValue: string | null;
  onValueChange: (value: string | null) => void;
  placeholder: string;
  label: string;
  disabled?: boolean;
}

const FilterDropdown: React.FC<FilterDropdownProps> = ({ items, selectedValue, onValueChange, placeholder, label, disabled = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonId = `filter-button-${label.toLowerCase().replace(/\s+/g, '-')}`;
  const menuId = `filter-menu-${label.toLowerCase().replace(/\s+/g, '-')}`;
  const labelId = `filter-label-${label.toLowerCase().replace(/\s+/g, '-')}`;

  const selectedItemName = items.find(item => (item.slug || String(item.id)) === selectedValue)?.name || placeholder;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (value: string | null) => {
    if (disabled) return;
    onValueChange(value);
    setIsOpen(false);
    (document.getElementById(buttonId) as HTMLButtonElement)?.focus();
  };

  return (
    <div className={`relative inline-block text-left w-full ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`} ref={dropdownRef}>
      <div>
        <label id={labelId} htmlFor={buttonId} className="text-sm text-slate-400 mb-1 block font-heading">{label}</label>
        <button
          id={buttonId}
          type="button"
          className={`inline-flex justify-between w-full rounded-md border border-slate-600 shadow-sm px-4 py-2.5 text-sm font-medium transition-colors
            ${disabled ? 'bg-slate-700 text-slate-500 cursor-not-allowed' : 'bg-slate-700 text-slate-200 hover:bg-slate-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-800 focus-visible:ring-fuchsia-600'}`}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          aria-haspopup="menu" 
          aria-expanded={isOpen}
          aria-controls={isOpen ? menuId : undefined}
          disabled={disabled}
        >
          <span className="truncate pr-1">{selectedItemName}</span>
          {ChevronDownIcon}
        </button>
      </div>

      {isOpen && !disabled && (
        <div 
          id={menuId}
          className="origin-top-right absolute right-0 mt-2 w-full min-w-[224px] md:w-64 rounded-md shadow-lg glassmorphic-menu ring-1 ring-black ring-opacity-5 z-20 max-h-72 overflow-y-auto custom-scrollbar-thin" // Increased max-h
          role="menu" 
          aria-orientation="vertical" 
          aria-labelledby={buttonId}
        >
          <div className="py-1">
            <button
                onClick={() => handleSelect(null)}
                className="block w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-fuchsia-600/20 hover:text-fuchsia-300 focus:bg-fuchsia-600/30 focus:text-fuchsia-300 focus:outline-none"
                role="menuitem"
              >
                {placeholder} (All)
              </button>
            {items.map(item => (
              <button
                key={item.id}
                onClick={() => handleSelect(item.slug || String(item.id))}
                className={`block w-full text-left px-4 py-2 text-sm ${
                  (item.slug || String(item.id)) === selectedValue ? 'bg-fuchsia-600 text-white font-semibold' : 'text-slate-300 hover:bg-fuchsia-600/20 hover:text-fuchsia-300'
                } focus:bg-fuchsia-600/30 focus:text-fuchsia-300 focus:outline-none`}
                role="menuitem"
                aria-current={(item.slug || String(item.id)) === selectedValue ? 'true' : undefined}
              >
                {item.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterDropdown;