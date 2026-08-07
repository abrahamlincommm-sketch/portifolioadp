import React from 'react';
import './Input.css';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, leftIcon, className = '', ...props }, ref) => {
    return (
      <div className={`ui-input-group ${className}`}>
        {label && <label className="ui-input-label">{label}</label>}
        <div className="ui-input-wrapper">
          {leftIcon && <span className="ui-input-icon">{leftIcon}</span>}
          <input
            ref={ref}
            className={`ui-input ${error ? 'error' : ''} ${leftIcon ? 'with-icon' : ''}`}
            {...props}
          />
        </div>
        {error && <span className="ui-input-error">{error}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';
