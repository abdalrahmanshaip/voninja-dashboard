import { Plus } from 'lucide-react'
import PropTypes from 'prop-types'
import { formatDateLocal } from '../../utils/dateFormat'
import { useEffect, useState } from 'react'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '../../utils/firebase'
import Table from '../common/Table'
import Modal from '../common/Modal'
import QuestionForm from './QuestionForm'
import ConfirmDialog from '../common/ConfirmDialog'
import { toast } from 'sonner'

const EventDetails = ({ event, onClose }) => {
  const [questions, setQuestions] = useState([])
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)
  const [questionToDelete, setQuestionToDelete] = useState(null)
  const [isEditQuestionOpen, setIsEditQuestionOpen] = useState(false)
  const [selectedQuestion, setSelectedQuestion] = useState(null)
  const [isAddQuestionOpen, setIsAddQuestionOpen] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(false)

  useEffect(() => {
    // Mock questions data
    const mockQuestions = [
      {
        id: 'q1',
        eventId: event?.id,
        content: 'What is the capital of France?',
        correct_answer: 'Paris',
        choices: ['Paris', 'London', 'Berlin', 'Madrid'],
        image_url: '',
      },
      {
        id: 'q2',
        eventId: event?.id,
        content: 'Which planet is known as the Red Planet?',
        correct_answer: 'Mars',
        choices: ['Earth', 'Mars', 'Jupiter', 'Venus'],
        image_url: '',
      },
      {
        id: 'q3',
        eventId: 'other-event-id',
        content: 'What is 2 + 2?',
        correct_answer: '4',
        choices: ['3', '4', '5', '6'],
        image_url: '',
      },
    ]

    if (event?.id) {
      const filteredQuestions = mockQuestions.filter(
        (q) => q.eventId === event.id
      )
      setQuestions(filteredQuestions)
    }
  }, [event?.id])

  // useEffect(() => {
  //   const fetchQuestions = async () => {
  //     if (!event?.id) return

  //     try {
  //       const q = query(
  //         collection(db, 'questions'),
  //         where('eventId', '==', event.id)
  //       )
  //       const querySnapshot = await getDocs(q)
  //       const questionsList = querySnapshot.docs.map((doc) => ({
  //         id: doc.id,
  //         ...doc.data(),
  //       }))
  //       setQuestions(questionsList)
  //     } catch (error) {
  //       console.error('Error fetching questions:', error)
  //     } finally {
  //       setLoading(false)
  //     }
  //   }

  //   fetchQuestions()
  // }, [event?.id])

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
      // try {
      //   await deleteTaskQuestion(challengeId, task.id, questionToDelete.id)
      //   setQuestionToDelete(null)
      //   setIsDeleteConfirmOpen(false)
      //   setRefreshTrigger(prev => !prev)
      //   toast.success('Question deleted successfully')
      // } catch (error) {
      //   toast.error('Failed to delete question: ' + error.message)
      // }
      toast.success('Deletedddd')
    }
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
    <>
      <div className='space-y-6 h-[80vh] overflow-y-auto'>
        <div className='overflow-auto'>
          <div className='flex justify-between items-start mb-6'>
            <div>
              <h2 className='text-2xl font-bold text-gray-900'>
                {event?.title}
              </h2>
              <p className='mt-2 text-gray-600'>{event?.description}</p>
            </div>
          </div>

          <div className='grid grid-cols-2 gap-4 mb-6'>
            <div>
              <h3 className='text-sm font-medium text-gray-500'>Start Date</h3>
              <p className='mt-1 text-sm text-gray-900'>
                {formatDateLocal(new Date(event?.startAt?.seconds * 1000))}
              </p>
            </div>
            <div>
              <h3 className='text-sm font-medium text-gray-500'>End Date</h3>
              <p className='mt-1 text-sm text-gray-900'>
                {formatDateLocal(new Date(event?.endAt?.seconds * 1000))}
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
              <button
                className='btn btn-primary flex items-center  text-base'
                onClick={() => setIsAddQuestionOpen(true)}
              >
                <Plus
                  size={20}
                  className='mr-2'
                />
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
      </div>
      <Modal
        isOpen={isAddQuestionOpen}
        onClose={() => setIsAddQuestionOpen(false)}
        title='Add Question'
      >
        <QuestionForm
          eventId={event?.id}
          onClose={() => setIsAddQuestionOpen(false)}
          setRefreshTrigger={setRefreshTrigger}
        />
      </Modal>

      <Modal
        isOpen={isEditQuestionOpen}
        onClose={() => setIsEditQuestionOpen(false)}
        title='Edit Question'
      >
        <QuestionForm
          eventId={event?.id}
          question={selectedQuestion}
          onClose={() => setIsEditQuestionOpen(false)}
          setRefreshTrigger={setRefreshTrigger}
        />
      </Modal>

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
  onClose: PropTypes.func.isRequired,
}
