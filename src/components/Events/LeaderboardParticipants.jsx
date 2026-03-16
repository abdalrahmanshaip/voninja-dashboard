import {
  Clock,
  Mail,
  Medal,
  Phone,
  Search,
  Star,
  Target,
  Trophy,
  User,
} from 'lucide-react'
import PropTypes from 'prop-types'
import { useEffect, useMemo, useState } from 'react'
import { useEvents } from '../../context/EventContext'
import Pagination from '../common/Pagination'

const usersPerPage = 10

const formatDate = (value) => {
  if (!value) return '-'
  if (value?.seconds) {
    return new Date(value.seconds * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }
  return '-'
}

const getRankIcon = (rank) => {
  if (rank === 1) return <Medal className='h-5 w-5 text-yellow-500' />
  if (rank === 2) return <Medal className='h-5 w-5 text-gray-400' />
  if (rank === 3) return <Medal className='h-5 w-5 text-amber-600' />
  return (
    <span className='text-xs font-bold text-gray-500 w-5 text-center'>
      {rank}
    </span>
  )
}

const rowBg = (rank) => {
  if (rank === 1) return 'bg-yellow-50 border-yellow-300'
  if (rank === 2) return 'bg-gray-50 border-gray-300'
  if (rank === 3) return 'bg-amber-50 border-amber-300'
  return 'bg-gray-50 border-gray-200 hover:bg-gray-100'
}

const LeaderboardParticipants = ({ event }) => {
  const { fetchLeaderboard } = useEvents()
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetchLeaderboard(event.id).then((data) => {
      if (!cancelled) {
        setEntries(data)
        setLoading(false)
      }
    })
    return () => { cancelled = true }
  }, [event.id, fetchLeaderboard])

  const filtered = useMemo(() => {
    if (!searchTerm.trim()) return entries
    const q = searchTerm.toLowerCase()
    return entries.filter(
      (e) =>
        e.userData.username?.toLowerCase().includes(q) ||
        e.userData.email?.toLowerCase().includes(q) ||
        e.userData.phoneNumber?.includes(searchTerm),
    )
  }, [entries, searchTerm])

  const totalPages = Math.ceil(filtered.length / usersPerPage)
  const startIndex = (currentPage - 1) * usersPerPage
  const currentEntries = filtered.slice(startIndex, startIndex + usersPerPage)

  if (loading) {
    return (
      <div className='flex items-center justify-center py-16 text-gray-500'>
        <div className='flex flex-col items-center gap-3'>
          <div className='h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600' />
          <span>Loading leaderboard…</span>
        </div>
      </div>
    )
  }

  return (
    <div className='space-y-4'>
      {/* Search */}
      <div className='relative'>
        <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400' />
        <input
          type='text'
          placeholder='Search by username, email, or phone…'
          value={searchTerm}
          onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1) }}
          className='input w-full ps-10 bg-white text-black'
        />
      </div>

      {/* Count chip */}
      <div className='flex gap-3 text-sm'>
        <span className='px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 font-medium border border-indigo-200'>
          Total participants: {entries.length}
        </span>
      </div>

      {filtered.length === 0 ? (
        <div className='text-center py-12 text-gray-500'>
          <User className='h-12 w-12 mx-auto mb-4 opacity-50' />
          <p>No participants found matching your criteria.</p>
        </div>
      ) : (
        <>
          {/* Table header */}
          <div className='hidden md:grid grid-cols-[40px_1fr_100px_100px_100px_160px] gap-3 px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-200'>
            <div>#</div>
            <div>User</div>
            <div className='text-center'>Score</div>
            <div className='text-center'>Correct</div>
            <div className='text-center'>Answered</div>
            <div className='text-center'>Last Answer</div>
          </div>

          <div className='space-y-2'>
            {currentEntries.map((entry, idx) => {
              const rank = startIndex + idx + 1
              return (
                <div
                  key={entry.uid}
                  className={`flex flex-col md:grid md:grid-cols-[40px_1fr_100px_100px_100px_160px] gap-3 items-center p-4 rounded-lg border transition-colors text-black ${rowBg(rank)}`}
                >
                  {/* Rank */}
                  <div className='flex items-center justify-center'>
                    {getRankIcon(rank)}
                  </div>

                  {/* User info */}
                  <div className='flex items-center gap-3 min-w-0'>
                    <div className='flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 border-2 border-indigo-200 flex items-center justify-center overflow-hidden'>
                      {entry.userData.avatar ? (
                        <img
                          src={entry.userData.avatar}
                          alt={entry.userData.username}
                          className='h-10 w-10 object-cover rounded-full'
                        />
                      ) : (
                        <span className='text-indigo-700 font-semibold text-sm'>
                          {entry.userData.username?.slice(0, 2).toUpperCase() || '??'}
                        </span>
                      )}
                    </div>
                    <div className='min-w-0'>
                      <p className='font-semibold text-gray-900 truncate'>
                        {entry.userData.username || entry.name}
                      </p>
                      <div className='flex flex-wrap gap-2 text-xs text-gray-500 mt-0.5'>
                        {entry.userData.email && (
                          <span className='flex items-center gap-1'>
                            <Mail className='h-3 w-3' />
                            {entry.userData.email}
                          </span>
                        )}
                        {entry.userData.phoneNumber && (
                          <span className='flex items-center gap-1'>
                            <Phone className='h-3 w-3' />
                            {entry.userData.phoneNumber}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Score */}
                  <div className='flex flex-col items-center'>
                    <span className='md:hidden text-xs text-gray-400 mb-0.5'>Score</span>
                    <span className='flex items-center gap-1 font-bold text-indigo-700'>
                      <Star className='h-3.5 w-3.5 text-indigo-400' />
                      {entry.score}
                    </span>
                  </div>

                  {/* Correct answers */}
                  <div className='flex flex-col items-center'>
                    <span className='md:hidden text-xs text-gray-400 mb-0.5'>Correct</span>
                    <span className='flex items-center gap-1 text-green-700 font-medium'>
                      <Target className='h-3.5 w-3.5 text-green-500' />
                      {entry.correctAnswers}
                    </span>
                  </div>

                  {/* Total answered */}
                  <div className='flex flex-col items-center'>
                    <span className='md:hidden text-xs text-gray-400 mb-0.5'>Answered</span>
                    <span className='flex items-center gap-1 text-gray-700 font-medium'>
                      <Trophy className='h-3.5 w-3.5 text-gray-400' />
                      {entry.answerCount}
                    </span>
                  </div>

                  {/* Last answered at */}
                  <div className='flex flex-col items-center text-center'>
                    <span className='md:hidden text-xs text-gray-400 mb-0.5'>Last Answer</span>
                    <span className='flex items-center gap-1 text-xs text-gray-600'>
                      <Clock className='h-3 w-3' />
                      {formatDate(entry.lastAnsweredAt)}
                    </span>
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

LeaderboardParticipants.propTypes = {
  event: PropTypes.shape({
    id: PropTypes.string.isRequired,
  }).isRequired,
}

export default LeaderboardParticipants
