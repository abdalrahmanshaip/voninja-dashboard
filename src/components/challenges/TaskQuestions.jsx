import { useEffect, useState } from 'react'
import { useChallenge } from '../../context/ChallengeContext'
import ConfirmDialog from '../common/ConfirmDialog'
import Modal from '../common/Modal'
import Table from '../common/Table'
import TaskQuestionForm from './TaskQuestionForm'
import { toast } from 'sonner'

const TaskQuestions = ({ challengeId, task, onClose }) => {
  const { getTaskQuestions, deleteTaskQuestion } = useChallenge()

  const [isAddQuestionOpen, setIsAddQuestionOpen] = useState(false)
  const [isEditQuestionOpen, setIsEditQuestionOpen] = useState(false)
  const [selectedQuestion, setSelectedQuestion] = useState(null)
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)
  const [questionToDelete, setQuestionToDelete] = useState(null)
  const [questions, setQuestions] = useState([])
  const [refreshTrigger, setRefreshTrigger] = useState(false)
  
  useEffect(() => {
    const fetchTaskQuestions = async () => {
      const fetchedTasks = await getTaskQuestions(challengeId, task.id)
      setQuestions(fetchedTasks)
    }
    fetchTaskQuestions()
  }, [challengeId, getTaskQuestions, task.id, refreshTrigger])

  if (!task) return null

  const handleDeleteQuestion = (question) => {
    setQuestionToDelete(question)
    setIsDeleteConfirmOpen(true)
  }

  const confirmDeleteQuestion = async () => {
    if (questionToDelete) {
      try {
        await deleteTaskQuestion(challengeId, task.id, questionToDelete.id)
        setQuestionToDelete(null)
        setIsDeleteConfirmOpen(false)
        setRefreshTrigger(prev => !prev)
        toast.success('Question deleted successfully')
      } catch (error) {
        toast.error('Failed to delete question: ' + error.message)
      }
    }
  }

  const handleEditQuestion = (question) => {
    setSelectedQuestion(question)
    setIsEditQuestionOpen(true)
  }

  const questionColumns = [
    { field: 'id', header: 'ID' },
    {
      field: 'content',
      header: 'Question',
      sortable: true,
      render: (row) => <div className='truncate max-w-xs'>{row.content}</div>,
    },
    {
      field: 'correct_answer',
      header: 'Correct Answer',
      sortable: true,
    },
    {
      field: 'choices',
      header: 'Choices',
      sortable: false,
      render: (row) => (
        <div className='truncate max-w-xs'>{row.choices.join(', ')}</div>
      ),
    },
    {
      field: 'image_url',
      header: 'Image',
      sortable: false,
      render: (row) =>
        row.image_url ? (
          <div className='flex items-center justify-center'>
            <img
              src={row.image_url}
              alt='Question'
              className='h-8 w-8 object-cover rounded'
            />
          </div>
        ) : (
          'No image'
        ),
    },
  ]

  const renderQuestionActions = (question) => (
    <>
      <button
        onClick={(e) => {
          e.stopPropagation()
          handleEditQuestion(question)
        }}
        className='text-green-600 hover:text-green-900 focus:outline-none'
      >
        Edit
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation()
          handleDeleteQuestion(question)
        }}
        className='ml-2 text-red-600 hover:text-red-900 focus:outline-none'
      >
        Delete
      </button>
    </>
  )

  return (
    <div className='space-y-6 h-[80vh] overflow-y-auto'>
      <div className='overflow-auto'>
      <div className='bg-gray-50 p-4 rounded-lg'>
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
          <div>
            <h3 className='text-sm font-medium text-gray-500'>Task</h3>
            <p className='mt-1 text-sm text-gray-900'>{task.title}</p>
          </div>
          <div>
            <h3 className='text-sm font-medium text-gray-500'>
              Questions Count
            </h3>
            <p className='mt-1 text-sm text-gray-900'>{questions.length}</p>
          </div>
        </div>
      </div>

      <div className='space-y-4'>
        <div className='flex justify-between items-center'>
          <h3 className='text-lg font-medium text-gray-900'>Task Questions</h3>
          <button
            onClick={() => setIsAddQuestionOpen(true)}
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
            Add Question
          </button>
        </div>
          <Table
            columns={questionColumns}
            data={questions}
            actions={renderQuestionActions}
            emptyMessage="No questions found. Click 'Add Question' to create one."
          />
      </div>
      </div>

      {/* Add Question Modal */}
      <Modal
        isOpen={isAddQuestionOpen}
        onClose={() => setIsAddQuestionOpen(false)}
        title='Add Question'
      >
        <TaskQuestionForm
          challengeId={challengeId}
          taskId={task.id}
          onClose={() => setIsAddQuestionOpen(false)}
          setRefreshTrigger={setRefreshTrigger}
        />
      </Modal>

      {/* Edit Question Modal */}
      <Modal
        isOpen={isEditQuestionOpen}
        onClose={() => setIsEditQuestionOpen(false)}
        title='Edit Question'
      >
        <TaskQuestionForm
          challengeId={challengeId}
          taskId={task.id}
          question={selectedQuestion}
          onClose={() => setIsEditQuestionOpen(false)}
          setRefreshTrigger={setRefreshTrigger}
        />
      </Modal>

      {/* Delete Question Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={confirmDeleteQuestion}
        title='Delete Question'
        message='Are you sure you want to delete this question? This action cannot be undone.'
        confirmText='Delete'
        cancelText='Cancel'
        type='danger'
      />
    </div>
  )
}

export default TaskQuestions
