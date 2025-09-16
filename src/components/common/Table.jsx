import {
  ArrowUpDown,
  CheckIcon,
  ChevronDown,
  ChevronUp,
  MoveDown,
  MoveUp,
} from 'lucide-react'
import PropTypes from 'prop-types'
import { useState } from 'react'
import Pagination from './Pagination'

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
  selectable = false,
  onSelectionChange,
}) => {

  const [currentPage, setCurrentPage] = useState(1)
  const [selectedRows, setSelectedRows] = useState([])

  const totalPages = pagination ? Math.ceil(data.length / itemsPerPage) : 0

  if (pagination) {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    data = data.slice(startIndex, endIndex)
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

      if (aValue == null) return 1
      if (bValue == null) return -1

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortConfig.direction === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue)
      }
      return sortConfig.direction === 'asc'
        ? aValue > bValue
          ? 1
          : -1
        : aValue < bValue
        ? 1
        : -1
    })
  }

  const getSortIcon = (key) => {
    if (!sortable) return null

    if (sortConfig.key !== key) {
      return <ArrowUpDown size={16} />
    }

    if (sortConfig.direction === 'asc') {
      return <ChevronUp size={16} />
    } else {
      return <ChevronDown size={16} />
    }
  }

  const toggleRowSelection = (row) => {
    let updated
    if (selectedRows.includes(row)) {
      updated = selectedRows.filter((r) => r !== row)
    } else {
      updated = [...selectedRows, row]
    }
    setSelectedRows(updated)
    onSelectionChange?.(updated)
  }

  const toggleSelectAll = () => {
    if (selectedRows.length === sortedData.length) {
      setSelectedRows([])
      onSelectionChange?.([])
    } else {
      setSelectedRows(sortedData)
      onSelectionChange?.(sortedData)
    }
  }

  const sortedData = getSortedData()

  return (
    <div className='space-y-10'>
      <table className='data-table'>
        <thead className='data-table-header'>
          <tr>
            {selectable && (
              <th className='data-table-head-cell'>
                <div className='w-fit relative cursor-pointer'>
                  <input
                    type='checkbox'
                    checked={
                      selectedRows.length === sortedData.length &&
                      sortedData.length > 0
                    }
                    onChange={toggleSelectAll}
                    className='peer appearance-none h-5 w-5 border border-gray-300 rounded-md checked:bg-black checked:border-transparent focus:outline-none cursor-pointer'
                  />
                  <CheckIcon
                    className='absolute top-1.5  left-1/2 -translate-x-1/2 w-3 h-3 text-white pointer-events-none hidden peer-checked:block'
                    strokeWidth='3'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  />
                </div>
              </th>
            )}
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
                colSpan={
                  columns.length + (actions ? 1 : 0) + (selectable ? 1 : 0)
                }
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
                {selectable && (
                  <td className='data-table-cell'>
                    <div className='w-fit relative cursor-pointer'>
                      <input
                        type='checkbox'
                        checked={selectedRows.includes(row)}
                        onChange={() => toggleRowSelection(row)}
                        className='peer appearance-none h-5 w-5 border border-gray-300 rounded-md checked:bg-black checked:border-transparent focus:outline-none cursor-pointer'
                      />
                      <CheckIcon
                        className='absolute top-1.5 left-1/2 -translate-x-1/2 h-3 w-3 text-white pointer-events-none hidden peer-checked:block'
                        strokeWidth='3'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                      />
                    </div>
                  </td>
                )}
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
                        <MoveUp />
                      </button>
                      <button
                        className='text-gray-500 hover:text-gray-700 disabled:text-gray-300'
                        onClick={() => onReorder(row, sortedData[rowIndex + 1])}
                        disabled={rowIndex === sortedData.length - 1}
                      >
                        <MoveDown />
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
  itemsPerPage: PropTypes.number,
  columns: PropTypes.array,
  data: PropTypes.array,
  onRowClick: PropTypes.any,
  actions: PropTypes.func,
  onReorder: PropTypes.func,
  emptyMessage: PropTypes.string,
  sortable: PropTypes.bool,
  initialSortField: PropTypes.string,
  initialSortDirection: PropTypes.string,
  selectable: PropTypes.bool,
  onSelectionChange: PropTypes.func,
}
