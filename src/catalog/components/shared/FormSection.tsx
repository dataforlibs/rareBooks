import React, { ReactNode } from 'react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

interface FormSectionProps {
  title: string;
  description?: string;
  standard?: string; // e.g., "DCRMR Chapter 1", "Dublin Core", "VRA Core"
  children: ReactNode;
  collapsible?: boolean;
  defaultOpen?: boolean;
  required?: boolean;
  helpText?: string;
}

const FormSection: React.FC<FormSectionProps> = ({
  title,
  description,
  standard,
  children,
  collapsible = false,
  defaultOpen = true,
  required = false,
  helpText
}) => {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);

  return (
    <div className="border-2 border-amber-200 rounded-lg shadow-lg bg-white overflow-hidden">
      {/* Header */}
      <div 
        className={`bg-gradient-to-r from-amber-100 to-orange-100 px-6 py-4 ${
          collapsible ? 'cursor-pointer hover:from-amber-150 hover:to-orange-150' : ''
        }`}
        onClick={() => collapsible && setIsOpen(!isOpen)}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-amber-900">
                {title}
                {required && <span className="text-red-600 ml-1">*</span>}
              </h2>
              {helpText && (
                <div className="group relative">
                  <HelpCircle 
                    className="text-amber-600 cursor-help" 
                    size={16} 
                  />
                  <div className="absolute left-0 top-6 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                    {helpText}
                    <div className="absolute bottom-full left-4 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-gray-900" />
                  </div>
                </div>
              )}
            </div>
            {description && (
              <p className="text-sm text-amber-700 mt-1">{description}</p>
            )}
            {standard && (
              <p className="text-xs text-amber-600 mt-1 font-medium">
                {standard}
              </p>
            )}
          </div>
          
          {collapsible && (
            <button 
              className="ml-4 text-amber-700 hover:text-amber-900 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(!isOpen);
              }}
            >
              {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      {(!collapsible || isOpen) && (
        <div className="px-6 py-6 space-y-4">
          {children}
        </div>
      )}
    </div>
  );
};

export default FormSection;
