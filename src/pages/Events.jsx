import { ArrowDownUp, FileQuestionMark, Minus, PencilOff, Plus, Trash, Users } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import ConfirmDialog from '../components/common/ConfirmDialog'
import Modal from '../components/common/Modal'
import Table from '../components/common/Table'
import EventDetails from '../components/Events/EventDetails'
import ParticipantDetailModal from '../components/Events/ParticipantDetailModal'
import ReorderEvents from '../components/Events/ReorderEvents'
import SharedEventForm from '../components/Events/SharedEventForm'
import { useEvents } from '../context/EventContext'
import { normalizeToDate } from '../utils/dateFormat'

const Events = () => {
  const { events, error, deleteEvent, usersWithEvents } = useEvents()

  const [activeTab, setActiveTab] = useState('basic')

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isUsersModalOpen, setIsUsersModalOpen] = useState(false)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [reorderModalOpen, setReorderModalOpen] = useState(false)
  const [eventToDelete, setEventToDelete] = useState(null)
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)

  const filteredEvents = events.filter((event) => {
    switch (activeTab) {
      case 'basic':
        return event.type !== 'multiplier' && event.type !== 'quiz'
      case 'double':
        return event.type === 'multiplier'
      case 'challenge':
        return event.type === 'quiz'
      default:
        return true
    }
  })

  const columns = [
    {
      field: 'imageUrl',
      header: 'Image',
      render: (row) => (
        <img
          src={row.imageUrl}
          alt={row.title}
          className='w-20 h-20 object-cover rounded mr-4 border'
        />
      ),
    },
    {
      field: 'title',
      header: 'Title',
    },
    {
      field: 'description',
      header: 'Description',
    },
    {
      field: 'rules',
      header: 'Rules',
      render: (row) => {
        switch (row.type) {
          case 'target_points':
            return (
              <div className='space-y-2'>
                <div>Target: {row.rules.targetGoal} points</div>
                <div>Reward: {row.rules.targetReward} points</div>
              </div>
            )
          case 'welcome':
            return (
              <div className='space-y-2'>
                <div>Goal: {row.rules.welcomeGoal} visits</div>
                <div>Reward: {row.rules.welcomeReward} points</div>
              </div>
            )
          case 'multiplier':
            return <div>Multiplier: {row.rules.multiplier}x</div>
          case 'quiz':
            return (
              <div className='space-y-2'>
                <div>Min Correct: {row.rules.quizMinCorrect}</div>
                <div>Reward: {row.rules.quizReward} points</div>
                <div>Total quiz: {row.rules.quizTotal}</div>
              </div>
            )
          default:
            return null
        }
      },
    },
    {
      field: 'startAt',
      header: 'Start Date',
      sortable: true,
      render: (row) => {
        const date = normalizeToDate(row.startAt)

        return (
          <span className='font-medium'>
            {date && !isNaN(date) ? (
              date.toLocaleString('en-US', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
              })
            ) : (
              <Minus strokeWidth={2} />
            )}
          </span>
        )
      },
    },
    {
      field: 'endAt',
      header: 'End Date',
      sortable: true,
      render: (row) => {
        let date = normalizeToDate(row.endAt)
        return (
          <span className='font-medium'>
            {date && !isNaN(date) ? (
              date.toLocaleString('en-US', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
              })
            ) : (
              <Minus strokeWidth={2} />
            )}
          </span>
        )
      },
    },
    {
      field: 'order',
      header: 'Order',
      sortable: true,
    },
  ]

  const handleAddEvent = () => {
    setSelectedEvent(null)
    setIsModalOpen(true)
  }

  const handleEditEvent = (event) => {
    setSelectedEvent(event)
    setIsModalOpen(true)
  }
  const handleViewDetails = (event) => {
    setSelectedEvent(event)
    setIsDetailsModalOpen(true)
  }

  const handleDeleteClick = (event) => {
    setEventToDelete(event)
    setIsDeleteConfirmOpen(true)
  }

  const handleUsersEvent = (event) => {
    setSelectedEvent(event)
    setIsUsersModalOpen(true)
  }

  const confirmDelete = async () => {
    if (eventToDelete) {
      try {
        await deleteEvent(eventToDelete.id)
        toast.success('Event deleted successfully')
        setEventToDelete(null)
        setIsDeleteConfirmOpen(false)
      } catch {
        toast.error(error || 'Failed to delete event')
      }
    }
  }

  const renderActions = (event) => (
    <div className='flex flex-col gap-3 mx-auto'>
      <button
        onClick={(e) => {
          e.stopPropagation()
          handleUsersEvent(event)
        }}
        className='text-indigo-600 hover:text-indigo-900 focus:outline-none'
      >
        <Users size={20} strokeWidth={2}/>
      </button>
      {event.type == 'quiz' && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            handleViewDetails(event)
          }}
          className='text-indigo-600 hover:text-indigo-900 focus:outline-none'
        >
          <FileQuestionMark size={20} strokeWidth={2}/>
        </button>
      )}
      <button
        onClick={(e) => {
          e.stopPropagation()
          handleEditEvent(event)
        }}
        className='text-blue-600 hover:text-blue-900 focus:outline-none mr-2'
      >
        <PencilOff size={20} strokeWidth={2}/>
      </button>
      {event.type !== 'welcome' && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            handleDeleteClick(event)
          }}
          className='text-red-600 hover:text-red-900 focus:outline-none'
        >
          <Trash size={20} strokeWidth={2}/>
        </button>
      )}
    </div>
  )

  return (
    <>
      <div className='space-y-6'>
        <div className='flex justify-between items-center'>
          <h1 className='text-2xl font-bold text-gray-900'>Events</h1>
          <div className='flex gap-x-5'>
            <button
              onClick={() => setReorderModalOpen(true)}
              className='btn btn-info flex items-center  text-base'
            >
              <ArrowDownUp
                size={20}
                className='mr-2'
              />
              Reorder Events
            </button>
            <button
              onClick={handleAddEvent}
              className='btn btn-primary flex items-center  text-base'
            >
              <Plus
                size={20}
                className='mr-2'
              />
              Create Event
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className='border-b border-gray-200'>
          <nav className='-mb-px flex space-x-8'>
            <button
              onClick={() => setActiveTab('basic')}
              className={`${
                activeTab === 'basic'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Basic Events
            </button>
            <button
              onClick={() => setActiveTab('double')}
              className={`${
                activeTab === 'double'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Double Points Events
            </button>
            <button
              onClick={() => setActiveTab('challenge')}
              className={`${
                activeTab === 'challenge'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Special Challenge Events
            </button>
          </nav>
        </div>

        {/* Table */}
        <div className='card'>
          <Table
            columns={columns}
            data={filteredEvents}
            actions={renderActions}
            onRowClick={activeTab == 'challenge' && handleViewDetails}
            emptyMessage="No events found. Click 'Add Event' to create one."
            initialSortField='order'
            initialSortDirection='asc'
          />
        </div>
      </div>

      <Modal
        isOpen={reorderModalOpen}
        onClose={() => setReorderModalOpen(false)}
        title={'Reorder Events'}
      >
        <ReorderEvents
          events={events}
          onClose={() => setReorderModalOpen(false)}
        />
      </Modal>

      <Modal
        size='lg'
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedEvent ? 'Edit Event' : 'Add New Event'}
      >
        <SharedEventForm
          event={selectedEvent}
          activeTab={activeTab}
          onClose={() => setIsModalOpen(false)}
        />
      </Modal>
      <Modal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        title='Event Details'
        size='full'
      >
        <EventDetails event={selectedEvent} />
      </Modal>
      <Modal
        isOpen={isUsersModalOpen}
        onClose={() => setIsUsersModalOpen(false)}
        size='xl'
      >
        <ParticipantDetailModal
          onClose={() => setIsUsersModalOpen(false)}
          usersWithEvents={usersWithEvents}
          event={selectedEvent}
        />
      </Modal>
      <ConfirmDialog
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={confirmDelete}
        title='Delete Event'
        message='Are you sure you want to delete this event? This action cannot be undone.'
        confirmText='Delete'
        cancelText='Cancel'
        type='danger'
      />
    </>
  )
}

export default Events
