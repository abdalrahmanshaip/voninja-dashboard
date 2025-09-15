import PropTypes from 'prop-types'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { useEvents } from '../../context/EventContext'
import { normalizeToDate } from '../../utils/dateFormat'
import ConfirmDialog from '../common/ConfirmDialog'
import Modal from '../common/Modal'
import QuestionActions from '../common/QuestionActions'
import Table from '../common/Table'
import QuestionForm from './QuestionForm'

const EventDetails = ({ event }) => {
  const {
    fetchQuestions,
    setQuestions,
    questions,
    handlePasteQuestions,
    deleteQuestion,
  } = useEvents()
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)
  const [questionToDelete, setQuestionToDelete] = useState(null)
  const [isEditQuestionOpen, setIsEditQuestionOpen] = useState(false)
  const [selectedQuestion, setSelectedQuestion] = useState(null)
  const [isAddQuestionOpen, setIsAddQuestionOpen] = useState(false)
  const [selectedRows, setSelectedRows] = useState([])

  useEffect(() => {
    const pushQuestionsToState = async () => {
      const data = await fetchQuestions(event?.id)
      setQuestions(data)
    }
    pushQuestionsToState()
  }, [event?.id, fetchQuestions, setQuestions])

  const handleDeleteQuestion = (question) => {
    setQuestionToDelete(question)
    setIsDeleteConfirmOpen(true)
  }
  const handleEditQuestion = (question) => {
    setSelectedQuestion(question)
    setIsEditQuestionOpen(true)
  }

  const confirmDeleteQuestion = async () => {
    if (questionToDelete) {
      try {
        await deleteQuestion(event?.id, questionToDelete.id)
        setQuestionToDelete(null)
        setIsDeleteConfirmOpen(false)
        toast.success('Question deleted successfully')
      } catch (error) {
        toast.error('Failed to delete question: ' + error.message)
      }
    }
  }
  const questionColumns = [
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
    <>
      <div className='space-y-6 min-h-[90vh]'>
        <div className='overflow-auto'>
          <div className='mb-6 space-y-2'>
            <h2 className='text-2xl font-bold text-gray-900'>{event?.title}</h2>
            <p className=' text-gray-600'>{event?.description}</p>
            <div className='flex items-center space-x-2'>
              <span className='text-gray-700 font-medium'>
                Total Questions:
              </span>
              <span className='inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-800 font-semibold text-sm shadow'>
                {questions.length}
              </span>
            </div>
          </div>

          <div className='grid grid-cols-2 gap-4 mb-6'>
            <div>
              <h3 className='text-sm font-medium text-gray-500'>Start Date</h3>
              <p className='mt-1 text-sm text-gray-900'>
                {normalizeToDate(event?.startAt).toLocaleString('en-US', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
            <div>
              <h3 className='text-sm font-medium text-gray-500'>End Date</h3>
              <p className='mt-1 text-sm text-gray-900'>
                {normalizeToDate(event?.endAt).toLocaleString('en-US', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>

          {event?.imageUrl && (
            <div className='mb-6'>
              <img
                src={event.imageUrl}
                alt={event.title}
                className='max-h-52 object-contain rounded-lg'
              />
            </div>
          )}

          <div className='mt-4'>
            <div className='flex items-center justify-between mb-4'>
              <h3 className='text-lg font-semibold'>Quiz Event Questions</h3>
              <QuestionActions
                handlePaste={() => handlePasteQuestions(event.id)}
                openAddModal={setIsAddQuestionOpen}
                selectedRows={selectedRows}
              />
            </div>

            <Table
              columns={questionColumns}
              data={questions}
              actions={renderQuestionActions}
              emptyMessage="No questions found. Click 'Add Question' to create one."
              selectable={true}
              onSelectionChange={(rows) => setSelectedRows(rows)}
            />
          </div>
        </div>
      </div>

      {/* Add Modal */}
      <Modal
        isOpen={isAddQuestionOpen}
        onClose={() => setIsAddQuestionOpen(false)}
        title='Add Question'
      >
        <QuestionForm
          eventId={event?.id}
          onClose={() => setIsAddQuestionOpen(false)}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditQuestionOpen}
        onClose={() => setIsEditQuestionOpen(false)}
        title='Edit Question'
      >
        <QuestionForm
          eventId={event?.id}
          question={selectedQuestion}
          onClose={() => setIsEditQuestionOpen(false)}
        />
      </Modal>

      {/* Delete Confirm */}
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
    </>
  )
}

export default EventDetails

EventDetails.propTypes = {
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
}
