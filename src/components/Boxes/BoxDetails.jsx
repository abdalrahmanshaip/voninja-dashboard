import PropTypes from 'prop-types'
import { useMemo, useState } from 'react'
import Pagination from '../common/Pagination'
import { normalizeToDate } from '../../utils/dateFormat'

const usersPerPage = 10

const BoxDetails = ({ box, selectedTier, boxesOpenedByUser }) => {
  const [currentPage, setCurrentPage] = useState(1)

  const boxIndex = box.index + 1

  const relatedUsersWithBox = useMemo(() => {
    return boxesOpenedByUser?.filter(
      (item) =>
        item.box[`${selectedTier}Index`] > 0 &&  item.box[`${selectedTier}Index`] >= boxIndex
    )
  }, [boxesOpenedByUser, boxIndex, selectedTier])


  const totalPages = Math.ceil(relatedUsersWithBox.length / usersPerPage)
  const startIndex = (currentPage - 1) * usersPerPage
  const endIndex = startIndex + usersPerPage
  const currentUsers = relatedUsersWithBox.slice(startIndex, endIndex)

  const formatDate = (date) => {
    if (!date) return '-'
    return normalizeToDate(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div>
      {relatedUsersWithBox.length === 0 ? (
        <p className='text-gray-500 text-center py-8'>
          No users have opened this box yet.
        </p>
      ) : (
        <>
          <div className='flex flex-col gap-4 mb-6'>
            {currentUsers.map((user, index) => {
              return (
                <div
                  key={startIndex + index}
                  className='text-black bg-muted/30 border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors'
                >
                  <div className='flex justify-between items-start mb-3'>
                    <div className='flex-1'>
                      <h3 className='font-bold text-card-foreground text-lg mb-1'>
                        {user.userData.username}
                      </h3>
                      <p className='text-sm text-gray-500'>
                        {user.userData.email}
                      </p>
                      <p className='text-sm text-gray-500'>
                        {user.userData.phoneNumber}
                      </p>
                    </div>
                    <div className='text-right'>
                      <div
                        className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                          selectedTier === 'bronze'
                            ? 'bg-amber-100 text-amber-800'
                            : selectedTier === 'silver'
                            ? 'bg-slate-100 text-slate-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {user.box.currentTier}
                      </div>
                    </div>
                  </div>

                  <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-sm'>
                    <div className='bg-background/50 rounded-md p-3'>
                      <p className='text-gray-500 mb-1'>Ads Watched</p>
                      <p className='font-semibold text-card-foreground'>
                        {user.box.currentAdsWatched}
                      </p>
                    </div>
                    <div className='bg-background/50 rounded-md p-3'>
                      <p className='text-gray-500 mb-1'>Cycle</p>
                      <p className='font-semibold text-card-foreground'>
                        {user.box.cycle}
                      </p>
                    </div>
                    <div className='bg-background/50 rounded-md p-3'>
                      <p className='text-gray-500 mb-1'>Index</p>
                      <p className='font-semibold text-card-foreground'>
                        {user.box.currentIndex}
                      </p>
                    </div>
                    <div className='bg-background/50 rounded-md p-3'>
                      <p className='text-gray-500 mb-1'>Updated</p>
                      <p className='font-semibold text-card-foreground text-xs'>
                        {formatDate(user.box.updatedAt)}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </>
      )}
    </div>
  )
}

export default BoxDetails

BoxDetails.propTypes = {
  box: PropTypes.object,
  selectedTier: PropTypes.string.isRequired,
  boxesOpenedByUser: PropTypes.arrayOf(
    PropTypes.shape({
      userData: PropTypes.shape({
        username: PropTypes.string,
        email: PropTypes.string,
        phoneNumber: PropTypes.string,
      }),
      box: PropTypes.object,
    })
  ),
}
