import { useState } from 'react';

const Table = ({ 
  columns, 
  data, 
  onRowClick,
  actions,
  emptyMessage = 'No data available',
  sortable = true,
  initialSortField = null,
  initialSortDirection = 'asc'
}) => {
  const [sortConfig, setSortConfig] = useState({
    key: initialSortField,
    direction: initialSortDirection
  });

  const handleSort = (key) => {
    if (!sortable) return;
    
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    
    setSortConfig({ key, direction });
  };

  const getSortedData = () => {
    if (!sortConfig.key) return data;
    
    return [...data].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      
      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        if (sortConfig.direction === 'asc') {
          return aValue.localeCompare(bValue);
        } else {
          return bValue.localeCompare(aValue);
        }
      }
      
      if (sortConfig.direction === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  };

  const getSortIcon = (key) => {
    if (!sortable) return null;
    
    if (sortConfig.key !== key) {
      return (
        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
        </svg>
      );
    }
    
    if (sortConfig.direction === 'asc') {
      return (
        <svg className="w-4 h-4 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
        </svg>
      );
    } else {
      return (
        <svg className="w-4 h-4 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      );
    }
  };

  const sortedData = getSortedData();

  return (
    <div className="table-responsive">
      <table className="data-table">
        <thead className="data-table-header">
          <tr>
            {columns.map((column) => (
              <th
                key={column.field}
                className={`data-table-head-cell ${column.sortable === false || !sortable ? '' : 'cursor-pointer'}`}
                onClick={() => column.sortable !== false && handleSort(column.field)}
              >
                <div className="flex items-center space-x-1">
                  <span>{column.header}</span>
                  {column.sortable !== false && getSortIcon(column.field)}
                </div>
              </th>
            ))}
            {actions && <th className="data-table-head-cell">Actions</th>}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {sortedData.length === 0 ? (
            <tr>
              <td
                className="px-6 py-10 text-center text-gray-500 whitespace-nowrap"
                colSpan={columns.length + (actions ? 1 : 0)}
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            sortedData.map((row, rowIndex) => (
              <tr
                key={row.id || rowIndex}
                className={`data-table-row ${onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''}`}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
              >
                {columns.map((column) => (
                  <td key={`${row.id}-${column.field}`} className="data-table-cell">
                    {column.render ? column.render(row) : row[column.field]}
                  </td>
                ))}
                {actions && (
                  <td className="data-table-cell">
                    <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
                      {actions(row)}
                    </div>
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;