import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const PasswordInput = ({ 
  id, 
  value, 
  onChange, 
  placeholder, 
  icon: Icon,
  required = true,
  disabled = false,
  className = ''
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className={`input-with-icon ${className}`} style={{ position: 'relative' }}>
      {Icon && <Icon className="input-icon" size={18} color="#64748b" />}
      
      <input 
        type={showPassword ? "text" : "password"} 
        id={id} 
        value={value} 
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        style={{ paddingRight: '40px' }}
      />
      
      <button 
        type="button" 
        onClick={() => setShowPassword(!showPassword)}
        tabIndex="-1"
        style={{
          position: 'absolute',
          right: '12px',
          top: '50%',
          transform: 'translateY(-50%)',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        title={showPassword ? "Hide password" : "Show password"}
      >
        {showPassword ? (
          <EyeOff size={18} color="#64748b" />
        ) : (
          <Eye size={18} color="#64748b" />
        )}
      </button>
    </div>
  );
};

export default PasswordInput;
