import {
  Clock,
  Mail,
  Phone,
  Search,
  Target,
  Trophy,
  User,
  X,
} from 'lucide-react'
import PropTypes from 'prop-types'
import { useMemo, useState } from 'react'
import { normalizeToDate } from '../../utils/dateFormat'

const getStatusColor = (status) => {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800 border-green-200'
    case 'completed':
      return 'bg-gray-100 text-gray-700 border-gray-200'
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case 'cancelled':
      return 'bg-red-100 text-red-800 border-red-200'
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200'
  }
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  return normalizeToDate(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const ParticipantDetailModal = ({ event, usersWithEvents, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const participants = useMemo(() => {
    return usersWithEvents.filter(
      (userevent) => userevent.event.eventId == event.id
    )
  }, [usersWithEvents, event])


  const filteredParticipants = useMemo(() => {
    return participants.filter((p) => {
      const matchesSearch =
        p.userData.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.userData.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.userData.phoneNumber?.includes(searchTerm)

      const matchesStatus =
        statusFilter === 'all' ||
        (p.event.status &&
          p.event.status.toLowerCase() === statusFilter.toLowerCase())

      return matchesSearch && matchesStatus
    })
  }, [participants, searchTerm, statusFilter])

  const statusCounts = useMemo(() => {
    return participants.reduce((acc, p) => {
      acc[p.event.status] = (acc[p.event.status] || 0) + 1
      return acc
    }, {})
  }, [participants])

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40'>
      <div className='bg-white rounded-2xl shadow-xl w-full max-w-5xl h-[80vh] flex flex-col'>
        {/* Header */}
        <div className='flex-shrink-0 p-6 border-b border-gray-200'>
          <div className='flex items-center justify-between mb-4'>
            <h2 className='text-2xl font-bold text-gray-900'>
              {event.title} - Participants
            </h2>
            <button
              onClick={() => onClose()}
              className='p-2 hover:bg-gray-100 rounded-full transition-colors'
            >
              <X className='h-5 w-5 text-gray-500' />
            </button>
          </div>

          <div className='flex flex-col sm:flex-row gap-4'>
            {/* Search */}
            <div className='relative flex-1'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
              <input
                type='text'
                placeholder='Search by username, email, or phone...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='input w-full ps-10 bg-white text-black'
              />
            </div>

            {/* Status Filters */}
            <div className='flex gap-2 flex-wrap'>
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-2 text-xs font-medium rounded-md transition-colors ${
                  statusFilter === 'all'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All ({participants.length})
              </button>
              {Object.entries(statusCounts).map(([status, count]) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-2 text-xs font-medium rounded-md transition-colors ${
                    statusFilter === status
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)} ({count})
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className='flex-1 overflow-y-auto p-6'>
          {filteredParticipants.length === 0 ? (
            <div className='text-center py-12 text-gray-500'>
              <User className='h-12 w-12 mx-auto mb-4 opacity-50' />
              <p>No participants found matching your criteria.</p>
            </div>
          ) : (
            <div className='space-y-4'>
              {filteredParticipants.map((p, index) => (
                <div
                  key={index}
                  className='flex items-start space-x-4 p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors text-black'
                >
                  {/* Avatar */}
                  <div className='flex-shrink-0'>
                    <div className='h-12 w-12 bg-indigo-100 rounded-full flex items-center justify-center border-2 border-indigo-200'>
                      <span className='text-indigo-700 font-semibold text-sm'>
                        {p.userData.username?.slice(0, 2).toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <div className='flex-1 space-y-3'>
                    {/* Basic Info */}
                    <div className='flex items-center justify-between'>
                      <div className='space-y-1'>
                        <h3 className='font-semibold text-gray-900'>
                          {p.userData.username}
                        </h3>
                        <div className='flex items-center gap-4 text-sm text-gray-600'>
                          {p.userData.email && (
                            <div className='flex items-center gap-1'>
                              <Mail className='h-3 w-3' />
                              {p.userData.email}
                            </div>
                          )}
                          {p.userData.phoneNumber && (
                            <div className='flex items-center gap-1'>
                              <Phone className='h-3 w-3' />
                              {p.userData.phoneNumber}
                            </div>
                          )}
                        </div>
                      </div>
                      {p.event.status && (
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(
                            p.event.status
                          )}`}
                        >
                          {p.event.status.charAt(0).toUpperCase() +
                            p.event.status.slice(1)}
                        </span>
                      )}
                    </div>

                    {/* Details Grid */}
                    <div className='grid grid-cols-1 md:grid-cols-3 gap-4 text-sm'>
                      {/* Progress */}
                      {/* Progress */}
                      {p.event.progress && (
                        <div className='space-y-2'>
                          <div className='flex items-center gap-2'>
                            <Target className='h-4 w-4 text-indigo-600' />
                            <span className='font-medium'>Progress</span>
                          </div>

                          {/* لو النوع quiz أو target_points */}
                          {(p.event.eventType === 'quiz' ||
                            p.event.eventType === 'target_points') && (
                            <div className='space-y-1'>
                              <div className='flex justify-between text-xs'>
                                <span>
                                  {p.event.progress.correctAnswers}/
                                  {event.rules?.quizTotal || 0} correct
                                </span>
                                <span>
                                  {event.rules?.quizTotal
                                    ? Math.round(
                                        (p.event.progress.correctAnswers /
                                          event.rules.quizTotal) *
                                          100
                                      )
                                    : 0}
                                  %
                                </span>
                              </div>
                              <div className='w-full bg-gray-200 rounded-full h-2'>
                                <div
                                  className='bg-indigo-600 h-2 rounded-full transition-all'
                                  style={{
                                    width: `${
                                      event.rules?.quizTotal
                                        ? (p.event.progress.correctAnswers /
                                            event.rules.quizTotal) *
                                          100
                                        : 0
                                    }%`,
                                  }}
                                />
                              </div>
                            </div>
                          )}

                          {/* لو النوع welcome */}
                          {p.event.eventType === 'welcome' && (
                            <div className='space-y-1 text-xs'>
                              <div>
                                Correct Answers:{' '}
                                <span className='font-medium'>
                                  {p.event.progress.correctAnswers || 0}
                                </span>
                              </div>
                              <div>
                                Points Accumulated:{' '}
                                <span className='font-medium'>
                                  {p.event.progress.pointsAccumulated || 0}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Points */}
                      <div className='space-y-2'>
                        <div className='flex items-center gap-2'>
                          <Trophy className='h-4 w-4 text-yellow-500' />
                          <span className='font-medium'>Points</span>
                        </div>
                        <div className='text-xs space-y-1'>
                          <div>
                            Accumulated:{' '}
                            <span className='font-medium'>
                              {p.event.pointsAccumulated || 0}
                            </span>
                          </div>
                          <div>
                            Rewards:{' '}
                            <span className='font-medium text-yellow-600'>
                              {p.event.rewardPoints || 0}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Timeline */}
                      <div className='space-y-2'>
                        <div className='flex items-center gap-2'>
                          <Clock className='h-4 w-4 text-blue-500' />
                          <span className='font-medium'>Timeline</span>
                        </div>
                        <div className='text-xs space-y-1'>
                          <div>Started: {formatDate(p.event.userStartAt)}</div>
                          {p.event.userEndAt && (
                            <div>Ended: {formatDate(p.event.userEndAt)}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ParticipantDetailModal

ParticipantDetailModal.propTypes = {
  event: PropTypes.shape({
    id: PropTypes.string,
    title: PropTypes.string,
    description: PropTypes.string,
    imageUrl: PropTypes.string,
    startAt: PropTypes.shape({
      seconds: PropTypes.number,
    }),
    endAt: PropTypes.shape({
      seconds: PropTypes.number,
    }),
    createdAt: PropTypes.any,
    type: PropTypes.string,
    rules: PropTypes.object,
  }),
  usersWithEvents: PropTypes.arrayOf(
    PropTypes.shape({
      userData: PropTypes.shape({
        userName: PropTypes.string,
        email: PropTypes.string,
        phoneNumber: PropTypes.string,
      }),
      event: PropTypes.shape({
        eventId: PropTypes.string,
        userId: PropTypes.string,
        createdAt: PropTypes.any,
        lastUpdatedAt: PropTypes.any,
        eventType: PropTypes.string,
        progress: PropTypes.object,
        answerCount: PropTypes.number,
        correctAnswers: PropTypes.number,
        pointsAccumulated: PropTypes.number,
        rewardPoints: PropTypes.number,
        status: PropTypes.string,
        userStartAt: PropTypes.any,
        userEndAt: PropTypes.any,
      }),
    })
  ),
  onClose: PropTypes.func.isRequired,
}
