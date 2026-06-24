import React from 'react';

const DataTable = ({ headers = [], children, emptyMessage = 'No data available' }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              {headers.map((header, index) => (
                <th
                  key={index}
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200 text-sm text-slate-700">
            {children}
          </tbody>
        </table>
      </div>
      {!React.Children.count(children) && (
        <div className="p-8 text-center text-slate-500 text-sm">
          {emptyMessage}
        </div>
      )}
    </div>
  );
};

export default DataTable;
