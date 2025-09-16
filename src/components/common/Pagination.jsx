import { ChevronLeft, ChevronRight } from 'lucide-react'
import PropTypes from 'prop-types'

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  maxVisiblePages = 5,
}) => {
  const getVisiblePages = () => {
    if (totalPages <= maxVisiblePages) {
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }

    const start = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
    const end = Math.min(totalPages, start + maxVisiblePages - 1)
    const adjustedStart = Math.max(1, end - maxVisiblePages + 1)

    return Array.from(
      { length: end - adjustedStart + 1 },
      (_, i) => adjustedStart + i
    )
  }

  const visiblePages = getVisiblePages()

  return (
    <nav className='flex items-center justify-center space-x-1'>
      {/* Previous Button */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
          currentPage === 1
            ? 'text-muted-foreground cursor-not-allowed opacity-50'
            : 'text-foreground hover:bg-muted hover:text-foreground'
        }`}
      >
        <ChevronLeft className='w-4 h-4 mr-1' />
        Previous
      </button>

      {/* Page Numbers */}
      <div className='flex items-center space-x-1'>
        {visiblePages.map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              currentPage === page
                ? 'bg-primary text-primary-foreground'
                : 'text-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            {page}
          </button>
        ))}
      </div>

      {/* Next Button */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
          currentPage === totalPages
            ? 'text-muted-foreground cursor-not-allowed opacity-50'
            : 'text-foreground hover:bg-muted hover:text-foreground'
        }`}
      >
        Next
        <ChevronRight className='w-4 h-4 ml-1' />
      </button>
    </nav>
  )
}

export default Pagination

Pagination.propTypes = {
  currentPage: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  maxVisiblePages: PropTypes.number,
}
