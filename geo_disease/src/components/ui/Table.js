import React from 'react';

const Table = ({ headers, children }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-separate border-spacing-y-2">
        <thead>
          <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
            {headers.map((header, i) => (
              <th key={i} className="px-6 py-3 font-black">{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {children}
        </tbody>
      </table>
    </div>
  );
};

export default Table;