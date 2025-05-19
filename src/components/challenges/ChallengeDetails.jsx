import { useEffect, useState } from 'react'
import { useChallenge } from '../../context/ChallengeContext'
import Table from '../common/Table'
import Modal from '../common/Modal'
import ConfirmDialog from '../common/ConfirmDialog'
import TaskForm from './TaskForm'
import TaskQuestions from './TaskQuestions'

const ChallengeDetails = ({ challenge, onClose }) => {
  const { getTasks, deleteTask } = useChallenge()

  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false)
  const [isEditTaskOpen, setIsEditTaskOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState(null)
  const [isTaskQuestionsOpen, setIsTaskQuestionsOpen] = useState(false)
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)
  const [taskToDelete, setTaskToDelete] = useState(null)
  const [tasks, setTasks] = useState([])

  useEffect(() => {
    const fetchTasks = async () => {
      const fetchedTasks = await getTasks(challenge.id)
      setTasks(fetchedTasks)
    }
    fetchTasks()
  }, [challenge.id, getTasks])
  if (!challenge) return null

  console.log(tasks)

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleString()
  }

  const handleDeleteTask = (task) => {
    setTaskToDelete(task)
    setIsDeleteConfirmOpen(true)
  }

  const confirmDeleteTask = () => {
    if (taskToDelete) {
      deleteTask(challenge.id, taskToDelete.id)
      setTaskToDelete(null)
    }
  }

  const handleEditTask = (task) => {
    setSelectedTask(task)
    setIsEditTaskOpen(true)
  }

  const handleViewQuestions = (task) => {
    setSelectedTask(task)
    setIsTaskQuestionsOpen(true)
  }

  const taskColumns = [
    { field: 'id', header: 'ID' },
    { field: 'title', header: 'Title', sortable: true },
    { field: 'order', header: 'Order', sortable: true },
    {
      field: 'questions',
      header: 'Questions Count',
      sortable: true,
      render: (row) => row.numQuestions,
    },
  ]

  const renderTaskActions = (task) => (
    <>
      <button
        onClick={(e) => {
          e.stopPropagation()
          handleViewQuestions(task)
        }}
        className='text-indigo-600 hover:text-indigo-900 focus:outline-none'
      >
        Questions
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation()
          handleEditTask(task)
        }}
        className='ml-2 text-green-600 hover:text-green-900 focus:outline-none'
      >
        Edit
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation()
          handleDeleteTask(task)
        }}
        className='ml-2 text-red-600 hover:text-red-900 focus:outline-none'
      >
        Delete
      </button>
    </>
  )

  return (
    <div className='space-y-6 h-[80vh] overflow-y-scroll '>
      <div className='bg-gray-50 p-4 rounded-lg space-y-4'>
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-3'>
          <div>
            <h3 className='text-sm font-medium text-gray-500'>
              Challenge Title
            </h3>
            <p className='mt-1 text-sm text-gray-900'>{challenge.title}</p>
          </div>
          <div>
            <h3 className='text-sm font-medium text-gray-500'>End Time</h3>
            <p className='mt-1 text-sm text-gray-900'>
              {new Date(challenge.endTime.seconds * 1000).toLocaleString()}
            </p>
          </div>
          <div>
            <h3 className='text-sm font-medium text-gray-500'>
              Required Points
            </h3>
            <p className='mt-1 text-sm text-gray-900'>
              {challenge.subscriptionPoints}
            </p>
          </div>
        </div>

        <div className='grid grid-cols-1 gap-4 sm:grid-cols-3'>
          <div>
            <h3 className='text-sm font-medium text-gray-500'>
              Reward per Correct Answer
            </h3>
            <p className='mt-1 text-sm text-gray-900'>
              +{challenge.rewardPoints} points
            </p>
          </div>
          <div>
            <h3 className='text-sm font-medium text-gray-500'>
              Deduction per Wrong Answer
            </h3>
            <p className='mt-1 text-sm text-gray-900'>
              -{challenge.deducePoints} points
            </p>
          </div>
          <div>
            <h3 className='text-sm font-medium text-gray-500'>
              Number of Tasks
            </h3>
            <p className='mt-1 text-sm text-gray-900'>{tasks.length}</p>
          </div>
        </div>

        <div className='grid grid-cols-1 gap-4 sm:grid-cols-3'>
          <div>
            <h3 className='text-sm font-medium text-gray-500'>
              1st Place Reward
            </h3>
            <p className='mt-1 text-sm text-gray-900'>
              {challenge.rewards.additionalProp1} points
            </p>
          </div>
          <div>
            <h3 className='text-sm font-medium text-gray-500'>
              2nd Place Reward
            </h3>
            <p className='mt-1 text-sm text-gray-900'>
              {challenge.rewards.additionalProp2} points
            </p>
          </div>
          <div>
            <h3 className='text-sm font-medium text-gray-500'>
              3rd Place Reward
            </h3>
            <p className='mt-1 text-sm text-gray-900'>
              {challenge.rewards.additionalProp3} points
            </p>
          </div>
        </div>
      </div>

      <div className='space-y-4'>
        <div className='flex justify-between items-center'>
          <h3 className='text-lg font-medium text-gray-900'>Challenge Tasks</h3>
          <button
            onClick={() => setIsAddTaskOpen(true)}
            className='btn btn-primary flex items-center'
          >
            <svg
              className='w-5 h-5 mr-2'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth='2'
                d='M12 6v6m0 0v6m0-6h6m-6 0H6'
              />
            </svg>
            Add Task
          </button>
        </div>

        <Table
          columns={taskColumns}
          data={tasks}
          actions={renderTaskActions}
          onRowClick={handleViewQuestions}
          emptyMessage="No tasks found. Click 'Add Task' to create one."
          initialSortField='order'
          initialSortDirection='asc'
        />
      </div>

      {/* Add Task Modal */}
      <Modal
        isOpen={isAddTaskOpen}
        onClose={() => setIsAddTaskOpen(false)}
        title='Add Task'
      >
        <TaskForm
          challengeId={challenge.id}
          onClose={() => setIsAddTaskOpen(false)}
        />
      </Modal>

      {/* Edit Task Modal */}
      <Modal
        isOpen={isEditTaskOpen}
        onClose={() => setIsEditTaskOpen(false)}
        title='Edit Task'
      >
        <TaskForm
          challengeId={challenge.id}
          task={selectedTask}
          onClose={() => setIsEditTaskOpen(false)}
        />
      </Modal>

      {/* Task Questions Modal */}
      <Modal
        isOpen={isTaskQuestionsOpen}
        onClose={() => setIsTaskQuestionsOpen(false)}
        title={selectedTask ? `Task: ${selectedTask.title}` : 'Task Questions'}
        size='lg'
      >
        <TaskQuestions
          challengeId={challenge.id}
          task={selectedTask}
          onClose={() => setIsTaskQuestionsOpen(false)}
        />
      </Modal>

      {/* Delete Task Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={confirmDeleteTask}
        title='Delete Task'
        message='Are you sure you want to delete this task? All associated questions will also be deleted. This action cannot be undone.'
        confirmText='Delete'
        cancelText='Cancel'
        type='danger'
      />
    </div>
  )
}

export default ChallengeDetails
