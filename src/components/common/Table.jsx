import { useState } from 'react'
import Pagination from './Pagination'
import PropTypes from 'prop-types'


const Table = ({
  pagination = false,
  itemsPerPage = 10,
  columns,
  data,
  onRowClick,
  actions,
  onReorder,
  emptyMessage = 'No data available',
  sortable = true,
  initialSortField = null,
  initialSortDirection = 'asc',
}) => {
  const [currentPage, setCurrentPage] = useState(1)
  const totalPages = pagination ? Math.ceil(data.length / itemsPerPage) : 0

  if (pagination) {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const currentItems = data.slice(startIndex, endIndex)
    data = currentItems
  }

  const [sortConfig, setSortConfig] = useState({
    key: initialSortField,
    direction: initialSortDirection,
  })

  const handleSort = (key) => {
    if (!sortable) return

    let direction = 'asc'
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }

    setSortConfig({ key, direction })
  }

  const getSortedData = () => {
    if (!sortConfig.key) return data

    return [...data].sort((a, b) => {
      const aValue = a[sortConfig.key]
      const bValue = b[sortConfig.key]

      if (aValue === null || aValue === undefined) return 1
      if (bValue === null || bValue === undefined) return -1

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        if (sortConfig.direction === 'asc') {
          return aValue.localeCompare(bValue)
        } else {
          return bValue.localeCompare(aValue)
        }
      }

      if (sortConfig.direction === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })
  }

  const getSortIcon = (key) => {
    if (!sortable) return null

    if (sortConfig.key !== key) {
      return (
        <svg
          className='w-4 h-4 text-gray-400'
          fill='none'
          viewBox='0 0 24 24'
          stroke='currentColor'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M8 9l4-4 4 4m0 6l-4 4-4-4'
          />
        </svg>
      )
    }

    if (sortConfig.direction === 'asc') {
      return (
        <svg
          className='w-4 h-4 text-gray-700'
          fill='none'
          viewBox='0 0 24 24'
          stroke='currentColor'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M5 15l7-7 7 7'
          />
        </svg>
      )
    } else {
      return (
        <svg
          className='w-4 h-4 text-gray-700'
          fill='none'
          viewBox='0 0 24 24'
          stroke='currentColor'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M19 9l-7 7-7-7'
          />
        </svg>
      )
    }
  }

  const sortedData = getSortedData()

  return (
    <div className='table-responsive space-y-10'>
      <table className='data-table'>
        <thead className='data-table-header'>
          <tr>
            {columns.map((column, index) => (
              <th
                key={index}
                className={`data-table-head-cell ${
                  column.sortable === false || !sortable ? '' : 'cursor-pointer'
                }`}
                onClick={() =>
                  column.sortable !== false && handleSort(column.field)
                }
              >
                <div className='flex items-center space-x-1'>
                  <span>{column.header}</span>
                  {column.sortable !== false && getSortIcon(column.field)}
                </div>
              </th>
            ))}
            {actions && <th className='data-table-head-cell'>Actions</th>}
            {onReorder && <th className='data-table-head-cell'>Reorder</th>}
          </tr>
        </thead>
        <tbody className='bg-white divide-y divide-gray-200'>
          {sortedData.length === 0 ? (
            <tr>
              <td
                className='px-6 py-10 text-center text-gray-500 whitespace-nowrap'
                colSpan={columns.length + (actions ? 1 : 0)}
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            sortedData.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className={`data-table-row ${
                  onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''
                }`}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
              >
                {columns.map((column, index) => (
                  <td
                    key={index}
                    className='data-table-cell'
                  >
                    {column.render ? column.render(row) : row[column.field]}
                  </td>
                ))}
                {actions && (
                  <td className='data-table-cell'>
                    <div
                      className='flex items-center space-x-2'
                      onClick={(e) => e.stopPropagation()}
                    >
                      {actions(row)}
                    </div>
                  </td>
                )}
                {onReorder && (
                  <td className='data-table-cell'>
                    <div
                      className='flex items-center space-x-2'
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        className='text-gray-500 hover:text-gray-700 disabled:text-gray-300'
                        onClick={() => onReorder(row, sortedData[rowIndex - 1])}
                        disabled={rowIndex === 0}
                      >
                        ▲
                      </button>
                      <button
                        className='text-gray-500 hover:text-gray-700 disabled:text-gray-300'
                        onClick={() => onReorder(row, sortedData[rowIndex + 1])}
                        disabled={rowIndex === sortedData.length - 1}
                      >
                        ▼
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
      {pagination && totalPages > 1 && (
        <div className='pb-2'>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  )
}

export default Table

Table.propTypes = {
  pagination: PropTypes.bool,
  itemsPerPage:  PropTypes.number,
  columns: PropTypes.array,
  data: PropTypes.array,
  onRowClick: PropTypes.any,
  actions: PropTypes.func,
  onReorder: PropTypes.func,
  emptyMessage: PropTypes.string,
  sortable: PropTypes.bool,
  initialSortField: PropTypes.string,
  initialSortDirection: PropTypes.string,
}
