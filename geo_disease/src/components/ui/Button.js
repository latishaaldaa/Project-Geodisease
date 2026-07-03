import React from 'react';

const Button = ({ children, variant = 'primary', onClick, type = 'button', className = '' }) => {
  const variants = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-100',
    secondary: 'bg-slate-900 text-white hover:bg-slate-800',
    outline: 'border border-slate-200 text-slate-600 hover:bg-slate-50',
    danger: 'bg-rose-500 text-white hover:bg-rose-600',
    success: 'bg-emerald-500 text-white hover:bg-emerald-600'
  };

  return (
    <button
      type={type}
      onClick={onClick}
      className={`px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all shadow-lg active:scale-95 ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;