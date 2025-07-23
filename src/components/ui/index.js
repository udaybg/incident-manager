import React from 'react';

// Card Components
export const Card = ({ children, className = '', ...props }) => (
  <div className={`bg-white rounded-xl shadow-sm ${className}`} {...props}>
    {children}
  </div>
);

export const CardHeader = ({ children, className = '', ...props }) => (
  <div className={`p-6 pb-4 ${className}`} {...props}>
    {children}
  </div>
);

export const CardTitle = ({ children, className = '', ...props }) => (
  <h3 className={`text-lg font-semibold leading-none tracking-tight ${className}`} {...props}>
    {children}
  </h3>
);

export const CardContent = ({ children, className = '', ...props }) => (
  <div className={`p-6 pt-2 ${className}`} {...props}>
    {children}
  </div>
);

// Button Component
export const Button = ({ 
  children, 
  variant = 'default', 
  size = 'default', 
  className = '',
  disabled = false,
  ...props 
}) => {
  const baseClasses = "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background";
  
  const variants = {
    default: "bg-blue-600 text-white hover:bg-blue-700",
    outline: "bg-white text-gray-700 hover:bg-gray-50",
    ghost: "hover:bg-gray-100 text-gray-700",
    destructive: "bg-red-600 text-white hover:bg-red-700"
  };
  
  const sizes = {
    default: "h-10 py-1.5 px-3",
    sm: "h-9 px-2.5 py-1 text-sm",
    lg: "h-11 px-6 py-2",
    icon: "h-10 w-10"
  };
  
  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

// Input Component
export const Input = ({ className = '', type = 'text', ...props }) => (
  <input
    type={type}
    className={`flex h-8 w-full rounded-xl text-gray-900 px-3 py-1 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    style={{ backgroundColor: '#dbdfe3', border: 'none', borderRadius: '0.75rem', ...props.style }}
    {...props}
  />
);

// Textarea Component
export const Textarea = ({ className = '', ...props }) => (
  <textarea
    className={`flex min-h-[60px] w-full rounded-xl text-gray-900 px-3 py-1 text-sm ring-offset-background placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    style={{ backgroundColor: '#dbdfe3', border: 'none', borderRadius: '0.75rem', ...props.style }}
    {...props}
  />
);

// Select Components
export const Select = ({ children, value, onValueChange, ...props }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [selectedValue, setSelectedValue] = React.useState(value || '');
  const selectRef = React.useRef(null);

  React.useEffect(() => {
    setSelectedValue(value || '');
  }, [value]);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
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

  const handleSelect = (newValue) => {
    setSelectedValue(newValue);
    if (onValueChange) {
      onValueChange(newValue);
    }
    setIsOpen(false);
  };

  // Find all SelectItem components and add click handlers
  const processChildren = (children) => {
    return React.Children.map(children, child => {
      if (child.props && child.props.value !== undefined) {
        // This is a SelectItem
        return React.cloneElement(child, {
          onClick: (e) => {
            e.stopPropagation();
            handleSelect(child.props.value);
          },
          key: child.props.value
        });
      } else if (child.props && child.props.children) {
        // This might be SelectContent, process its children
        return React.cloneElement(child, {
          children: processChildren(child.props.children),
          key: child.key || 'select-content'
        });
      }
      return child;
    });
  };

  return (
    <div className="relative" ref={selectRef}>
      <SelectTrigger onClick={() => setIsOpen(!isOpen)} {...props}>
        <SelectValue value={selectedValue} />
      </SelectTrigger>
      {isOpen && processChildren(children)}
    </div>
  );
};

export const SelectTrigger = ({ children, className = '', ...props }) => (
  <button
    type="button"
    className={`flex h-8 w-full items-center justify-between rounded-xl text-gray-900 px-3 py-1 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    style={{ backgroundColor: '#dbdfe3', border: 'none', ...props.style }}
    {...props}
  >
    {children}
    <svg className="h-4 w-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  </button>
);

export const SelectValue = ({ value, placeholder = "Select..." }) => (
  <span className="block truncate">
    {value ? value : (
      <span className="text-gray-500">{placeholder}</span>
    )}
  </span>
);

export const SelectContent = ({ children, className = '' }) => (
  <div className={`absolute top-full left-0 right-0 z-50 max-h-96 overflow-auto rounded-xl py-1 shadow-lg mt-1 ${className}`} style={{ backgroundColor: '#f0f4f8', zIndex: 9999 }}>
    {children}
  </div>
);

export const SelectItem = ({ children, value, className = '', onClick, ...props }) => (
  <div
    className={`relative flex cursor-pointer select-none items-center rounded-sm py-1.5 pl-3 pr-2 text-sm text-gray-900 outline-none hover:bg-gray-300 focus:bg-gray-300 ${className}`}
    onClick={onClick}
    {...props}
  >
    {children}
  </div>
);

// Tabs Components
export const Tabs = ({ children, value, onValueChange, className = '' }) => {
  const [activeTab, setActiveTab] = React.useState(value);

  React.useEffect(() => {
    setActiveTab(value);
  }, [value]);

  return (
    <div className={className}>
      {React.Children.map(children, child => 
        React.cloneElement(child, { activeTab, setActiveTab, onValueChange })
      )}
    </div>
  );
};

export const TabsList = ({ children, className = '', activeTab, setActiveTab, onValueChange }) => (
  <div className={`inline-flex h-10 items-center justify-center rounded-md bg-gray-100 p-1 text-gray-500 ${className}`}>
    {React.Children.map(children, child => 
      React.cloneElement(child, { 
        activeTab, 
        setActiveTab: (value) => {
          setActiveTab(value);
          onValueChange(value);
        }
      })
    )}
  </div>
);

export const TabsTrigger = ({ children, value, activeTab, setActiveTab, className = '' }) => (
  <button
    className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
      activeTab === value 
        ? 'bg-white text-gray-900 shadow-sm' 
        : 'text-gray-600 hover:text-gray-900'
    } ${className}`}
    onClick={() => setActiveTab(value)}
  >
    {children}
  </button>
);

export const TabsContent = ({ children, value, activeTab, className = '' }) => (
  activeTab === value ? (
    <div className={`mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${className}`}>
      {children}
    </div>
  ) : null
);

// Badge Component
export const Badge = ({ children, variant = 'default', className = '', ...props }) => {
  const variants = {
    default: 'bg-blue-100 text-blue-800',
    secondary: 'bg-gray-100 text-gray-800',
    destructive: 'bg-red-100 text-red-800',
    warning: 'bg-yellow-100 text-yellow-800'
  };
  
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${variants[variant]} ${className}`} {...props}>
      {children}
    </span>
  );
};

// Alert Components
export const Alert = ({ children, variant = 'default', className = '', ...props }) => {
  const variants = {
    default: 'border-blue-200 bg-blue-50 text-blue-800',
    destructive: 'border-red-200 bg-red-50 text-red-800'
  };
  
  return (
    <div className={`relative w-full rounded-md border px-4 py-3 text-sm ${variants[variant]} ${className}`} {...props}>
      {children}
    </div>
  );
};

export const AlertDescription = ({ children, className = '', ...props }) => (
  <div className={`text-sm ${className}`} {...props}>
    {children}
  </div>
);

// Multi-Select Component
export const MultiSelect = ({ children, values = [], onValuesChange, placeholder = "Select...", ...props }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [selectedValues, setSelectedValues] = React.useState(values);
  const selectRef = React.useRef(null);

  React.useEffect(() => {
    setSelectedValues(values);
  }, [values]);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
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

  const handleSelect = (value) => {
    const newValues = selectedValues.includes(value)
      ? selectedValues.filter(v => v !== value)
      : [...selectedValues, value];
    
    setSelectedValues(newValues);
    if (onValuesChange) {
      onValuesChange(newValues);
    }
  };

  const removeValue = (valueToRemove) => {
    const newValues = selectedValues.filter(v => v !== valueToRemove);
    setSelectedValues(newValues);
    if (onValuesChange) {
      onValuesChange(newValues);
    }
  };

  // Find all SelectItem components and add click handlers
  const processChildren = (children) => {
    return React.Children.map(children, child => {
      if (child.props && child.props.value !== undefined) {
        // This is a SelectItem
        const isSelected = selectedValues.includes(child.props.value);
        return React.cloneElement(child, {
          onClick: (e) => {
            e.stopPropagation();
            handleSelect(child.props.value);
          },
          key: child.props.value,
          className: child.props.className || '',
          children: (
            <div className="flex items-center justify-between w-full">
              <span>{child.props.children}</span>
              {isSelected && <span className="text-gray-900">✓</span>}
            </div>
          )
        });
      } else if (child.props && child.props.children) {
        // This might be SelectContent, process its children
        return React.cloneElement(child, {
          children: processChildren(child.props.children),
          key: child.key || 'select-content'
        });
      }
      return child;
    });
  };

  return (
    <div className="relative" ref={selectRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex min-h-[32px] w-full items-center justify-between rounded-xl text-gray-900 px-3 py-1 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        style={{ backgroundColor: '#dbdfe3', border: 'none' }}
        {...props}
      >
        <div className="flex flex-wrap gap-1">
          {selectedValues.length === 0 ? (
            <span className="text-gray-500">{placeholder}</span>
          ) : (
            selectedValues.map((value) => (
              <span
                key={value}
                className="inline-flex items-center gap-1 px-2 py-1 bg-white text-black text-xs rounded-xl"
              >
                {value}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeValue(value);
                  }}
                  className="hover:bg-gray-200 rounded-sm p-0.5"
                >
                  <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            ))
          )}
        </div>
        <svg className="h-4 w-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && processChildren(children)}
    </div>
  );
};

// Checkbox Component
export const Checkbox = ({ id, checked, onCheckedChange, className = '', ...props }) => (
  <input
    type="checkbox"
    id={id}
    checked={checked}
    onChange={(e) => onCheckedChange(e.target.checked)}
    className={`h-4 w-4 rounded-lg focus:ring-gray-500 ${className}`}
    style={{ accentColor: 'black', ...props.style }}
    {...props}
  />
);

// ToggleButtons Component
export const ToggleButtons = ({ options, value, onChange, selectedBorderColor = 'border-black', incident = {} }) => (
  <div className="inline-flex gap-2" role="group">
    {options.map((option) => {
      const isSelected = value === option.value;
      
      // Determine colors based on the option value for critical selections
      let selectedStyles = 'bg-black text-white border border-black'; // default black
      if (isSelected) {
        if (option.value === 'L5') {
          // L5 color depends on scope selection
          if (incident.scope === 'High') {
            selectedStyles = 'bg-red-600 text-white border border-red-600';
          } else if (incident.scope === 'Medium') {
            selectedStyles = 'bg-orange-600 text-white border border-orange-600';
          } else {
            selectedStyles = 'bg-black text-white border border-black'; // Low or no scope
          }
        } else if (option.value === 'High' && incident.level === 'L5') {
          // High scope only gets red color when L5 is selected
          selectedStyles = 'bg-red-600 text-white border border-red-600';
        } else if (option.value === 'Medium' && incident.level === 'L5') {
          // Medium scope only gets orange color when L5 is selected
          selectedStyles = 'bg-orange-600 text-white border border-orange-600';
        }
      }
      
      return (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={`px-2 py-1 text-xs font-medium transition-all duration-200 rounded-xl ${
            isSelected
              ? selectedStyles
              : 'text-gray-700 hover:bg-gray-100 rounded-xl'
          }`}
          style={isSelected ? {} : { backgroundColor: '#dbdfe3' }}
        >
          {option.label}
        </button>
      );
    })}
  </div>
); 

export { default as Tooltip } from './Tooltip.jsx'; 