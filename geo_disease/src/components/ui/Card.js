import React from 'react';

const Card = ({ title, children, className = '' }) => {
  return (
    <div className={`bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm ${className}`}>
      {title && <h3 className="font-black text-slate-800 mb-6 text-lg tracking-tight">{title}</h3>}
      {children}
    </div>
  );
};

export default Card;