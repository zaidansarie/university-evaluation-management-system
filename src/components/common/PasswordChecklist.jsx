import React from 'react';
import { validatePassword } from '../../utils/passwordPolicy';
import { Check, X } from 'lucide-react';

const PasswordChecklist = ({ password, confirmPassword }) => {
  const { checks } = validatePassword(password);
  
  const rules = [
    { key: 'minLength', label: 'Minimum 8 characters' },
    { key: 'uppercase', label: 'One uppercase letter' },
    { key: 'lowercase', label: 'One lowercase letter' },
    { key: 'number', label: 'One number' },
    { key: 'special', label: 'One special character (@#$%&*!?_-)' },
    { key: 'noSpaces', label: 'No spaces' }
  ];

  return (
    <div style={{
      marginTop: '12px',
      padding: '12px',
      background: '#f8fafc',
      borderRadius: '8px',
      border: '1px solid #e2e8f0',
      fontSize: '0.85rem'
    }}>
      <h4 style={{ margin: '0 0 8px 0', fontSize: '0.85rem', color: '#334155' }}>Password Requirements</h4>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {rules.map(rule => (
          <li key={rule.key} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: checks[rule.key] ? '#15803d' : '#64748b' }}>
            {checks[rule.key] ? <Check size={14} strokeWidth={3} /> : <X size={14} strokeWidth={3} />}
            <span>{rule.label}</span>
          </li>
        ))}
        {confirmPassword !== undefined && (
          <li style={{ display: 'flex', alignItems: 'center', gap: '8px', color: (password && password === confirmPassword) ? '#15803d' : '#b91c1c', marginTop: '4px', paddingTop: '4px', borderTop: '1px solid #e2e8f0' }}>
            {(password && password === confirmPassword) ? <Check size={14} strokeWidth={3} /> : <X size={14} strokeWidth={3} />}
            <span>{(password && password === confirmPassword) ? 'Passwords match' : 'Passwords do not match'}</span>
          </li>
        )}
      </ul>
    </div>
  );
};

export default PasswordChecklist;
