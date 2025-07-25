import React, { useState, useRef, useEffect } from 'react';

const Tooltip = ({ content, children, className = "" }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0, placement: 'bottom' });
  const triggerRef = useRef(null);
  const tooltipRef = useRef(null);

  useEffect(() => {
    if (isVisible && triggerRef.current && tooltipRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      const viewport = {
        width: window.innerWidth,
        height: window.innerHeight
      };

      let placement = 'bottom';
      let top = triggerRect.bottom + 8; // 8px gap below trigger
      let left = triggerRect.left;

      // Check if tooltip would go off the bottom of the screen
      if (top + tooltipRect.height > viewport.height - 20) {
        placement = 'top';
        top = triggerRect.top - tooltipRect.height - 8; // 8px gap above trigger
      }

      // Check if tooltip would go off the top of the screen
      if (top < 20) {
        placement = 'bottom';
        top = triggerRect.bottom + 8; // Force it below
      }

      // Check if tooltip would go off the right side of the screen
      if (left + tooltipRect.width > viewport.width - 20) {
        left = viewport.width - tooltipRect.width - 20;
      }

      // Check if tooltip would go off the left side of the screen
      if (left < 20) {
        left = 20;
      }

      setPosition({ top, left, placement });
    }
  }, [isVisible]);

  if (!content) {
    return children;
  }

  const renderTooltipContent = () => {
    // Simple string tooltip
    if (typeof content === 'string') {
      return (
        <div 
          ref={tooltipRef}
          className="fixed z-50 w-80 p-4 rounded-xl shadow-lg bg-white border border-gray-200"
          style={{ 
            top: position.top, 
            left: position.left,
            maxWidth: 'calc(100vw - 40px)' // Ensure it doesn't exceed viewport
          }}
        >
          <p className="text-xs text-gray-800">{content}</p>
        </div>
      );
    }

    // Complex structured tooltip (for level/scope guidelines)
    if (content.title && content.sections) {
      return (
        <div 
          ref={tooltipRef}
          className="fixed z-50 w-80 p-4 rounded-xl shadow-lg bg-white border border-gray-200"
          style={{ 
            top: position.top, 
            left: position.left,
            maxWidth: 'calc(100vw - 40px)' // Ensure it doesn't exceed viewport
          }}
        >
          <h4 className="text-sm font-bold text-gray-900 mb-3">{content.title}</h4>
          {content.sections.map((section, index) => {
            const isLast = index === content.sections.length - 1;
            return (
              <div key={index} className={`${isLast ? '' : 'mb-3 pb-3 border-b border-gray-300'}`}>
                <h5 className="text-xs font-semibold text-gray-900 mb-1">{section.level}</h5>
                <p className="text-xs text-gray-800 mb-1">{section.description}</p>
                {section.details && (
                  <ul className="text-xs text-gray-800 list-disc ml-4">
                    {section.details.map((detail, detailIndex) => (
                      <li key={detailIndex}>{detail}</li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      );
    }

    return null;
  };

  return (
    <div className="relative inline-block">
      <div
        ref={triggerRef}
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        className={className}
      >
        {children}
        <span
          className="text-gray-400 hover:text-gray-600 cursor-help"
          onMouseEnter={() => setIsVisible(true)}
          onMouseLeave={() => setIsVisible(false)}
        >
          ⓘ
        </span>
      </div>
      
      {isVisible && (
        <div
          onMouseEnter={() => setIsVisible(true)}
          onMouseLeave={() => setIsVisible(false)}
        >
          {renderTooltipContent()}
        </div>
      )}
    </div>
  );
};

export default Tooltip; 