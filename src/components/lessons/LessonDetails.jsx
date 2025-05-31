import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { useData } from '../../context/DataContext'
import ConfirmDialog from '../common/ConfirmDialog'
import Modal from '../common/Modal'
import Table from '../common/Table'
import QuestionForm from './QuestionForm'
import VocabularyForm from './VocabularyForm'

const LessonDetails = ({ lesson, level, levelId }) => {
  const { deleteVocabulary, deleteQuestion, getVocabularies, getQuestions } =
    useData()
    
  const [questions, setQuestions] = useState([])
  const [vocabularies, setVocabularies] = useState([])
  const [activeTab, setActiveTab] = useState('vocabulary')
  const [isAddVocabularyOpen, setIsAddVocabularyOpen] = useState(false)
  const [isEditVocabularyOpen, setIsEditVocabularyOpen] = useState(false)
  const [selectedVocabulary, setSelectedVocabulary] = useState(null)
  const [isAddQuestionOpen, setIsAddQuestionOpen] = useState(false)
  const [isEditQuestionOpen, setIsEditQuestionOpen] = useState(false)
  const [selectedQuestion, setSelectedQuestion] = useState(null)
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState(null)
  const [deleteType, setDeleteType] = useState(null)


  useEffect(() => {
    const fetchVocabularies = async () => {
      try {
        const vocabularies = await getVocabularies(levelId, lesson.id)
        setVocabularies(vocabularies)
      } catch (error) {
        console.error('Error fetching vocabularies:', error)
      }
    }
  
    const fetchQuestions = async () => {
      try {
        const questions = await getQuestions(levelId, lesson.id)
        setQuestions(questions)
      } catch (error) {
        console.error('Error fetching vocabularies:', error)
      }
    }

    fetchVocabularies()
    fetchQuestions()
  }, [getQuestions, getVocabularies, lesson.id, levelId])

  if (!lesson) return null

  const handleDeleteVocabulary = (vocabulary) => {
    setItemToDelete(vocabulary)
    setDeleteType('vocabulary')
    setIsDeleteConfirmOpen(true)
  }

  const handleDeleteQuestion = (question) => {
    setItemToDelete(question)
    setDeleteType('question')
    setIsDeleteConfirmOpen(true)
  }

  const confirmDelete = async () => {
    try {
      if (deleteType === 'vocabulary') {
        await deleteVocabulary(levelId, lesson.id, itemToDelete.id)
        toast.success('Vocabulary deleted successfully')
      } else if (deleteType === 'question') {
        await deleteQuestion(levelId, lesson.id, itemToDelete.id)
        toast.success('Question deleted successfully')
      }
      setIsDeleteConfirmOpen(false)
    } catch (error) {
      console.error('Error deleting item:', error)
      toast.error('Failed to delete item. Please try again.')
    }
  }
  const handleEditVocabulary = (vocabulary) => {
    setSelectedVocabulary(vocabulary)
    setIsEditVocabularyOpen(true)
  }

  const handleEditQuestion = (question) => {
    setSelectedQuestion(question)
    setIsEditQuestionOpen(true)
  }

  const vocabularyColumns = [
    { field: 'id', header: 'ID' },
    { field: 'word', header: 'Word', sortable: true },
    { field: 'translated_word', header: 'Translated Word', sortable: true },
    {
      field: 'image',
      header: 'Image',
      sortable: false,
      render: (row) =>
        row.image_url ? (
          <div className='flex items-center justify-center'>
            <img
              src={row.image_url}
              alt={row.word}
              className='h-8 w-8 object-cover rounded'
            />
          </div>
        ) : (
          'No image'
        ),
    },
  ]

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
      render: (row) => (
        <div className='truncate max-w-xs'>
          {row.correct_answer || row.correctAnswer}
        </div>
      ),
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
      field: 'image',
      header: 'Image',
      sortable: false,
      render: (row) =>
        row.image ? (
          <div className='flex items-center justify-center'>
            <img
              src={row.image}
              alt='Question'
              className='h-8 w-8 object-cover rounded'
            />
          </div>
        ) : (
          'No image'
        ),
    },
  ]

  const renderVocabularyActions = (vocabulary) => (
    <>
      <button
        onClick={(e) => {
          e.stopPropagation()
          handleEditVocabulary(vocabulary)
        }}
        className='text-green-600 hover:text-green-900 focus:outline-none'
      >
        Edit
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation()
          handleDeleteVocabulary(vocabulary)
        }}
        className='ml-2 text-red-600 hover:text-red-900 focus:outline-none'
      >
        Delete
      </button>
    </>
  )

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
    <div className='space-y-6  h-[80vh] overflow-y-scroll '>
      <div className='bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 rounded-lg'>
        <div className='sm:col-span-1'>
          <dt className='text-sm font-medium text-gray-500'>Lesson Title</dt>
          <dd className='mt-1 text-sm text-gray-900'>{lesson.title}</dd>
        </div>
        <div className='mt-4 sm:mt-0 sm:col-span-1'>
          <dt className='text-sm font-medium text-gray-500'>Level</dt>
          <dd className='mt-1 text-sm text-gray-900'>{level}</dd>
        </div>
        <div className='mt-4 sm:mt-0 sm:col-span-1'>
          <dt className='text-sm font-medium text-gray-500'>Order</dt>
          <dd className='mt-1 text-sm text-gray-900'>{lesson.lesson_order}</dd>
        </div>
      </div>

      <div className='border-b border-gray-200 '>
        <nav className='-mb-px flex space-x-8'>
          <button
            onClick={() => setActiveTab('vocabulary')}
            className={`${
              activeTab === 'vocabulary'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm focus:outline-none`}
          >
            Vocabulary ({vocabularies.length})
          </button>
          <button
            onClick={() => setActiveTab('questions')}
            className={`${
              activeTab === 'questions'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm focus:outline-none`}
          >
            Questions ({questions.length})
          </button>
        </nav>
      </div>

      {activeTab === 'vocabulary' && (
        <div className='space-y-4'>
          <div className='flex justify-between items-center'>
            <h3 className='text-lg font-medium text-gray-900'>
              Vocabulary Words
            </h3>
            <button
              onClick={() => setIsAddVocabularyOpen(true)}
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
              Add Vocabulary
            </button>
          </div>
          <Table
            columns={vocabularyColumns}
            data={vocabularies}
            actions={renderVocabularyActions}
            emptyMessage="No vocabulary words found. Click 'Add Vocabulary' to create one."
          />
        </div>
      )}

      {activeTab === 'questions' && (
        <div className='space-y-4'>
          <div className='flex justify-between items-center'>
            <h3 className='text-lg font-medium text-gray-900'>Questions</h3>
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
      )}

      {/* Add Vocabulary Modal */}
      <Modal
        isOpen={isAddVocabularyOpen}
        onClose={() => setIsAddVocabularyOpen(false)}
        title='Add Vocabulary'
      >
        <VocabularyForm
          levelId={levelId}
          lessonId={lesson.id}
          onClose={() => setIsAddVocabularyOpen(false)}
        />
      </Modal>

      {/* Edit Vocabulary Modal */}
      <Modal
        isOpen={isEditVocabularyOpen}
        onClose={() => setIsEditVocabularyOpen(false)}
        title='Edit Vocabulary'
      >
        <VocabularyForm
          levelId={levelId}
          lessonId={lesson.id}
          vocabulary={selectedVocabulary}
          onClose={() => setIsEditVocabularyOpen(false)}
        />
      </Modal>

      {/* Add Question Modal */}
      <Modal
        isOpen={isAddQuestionOpen}
        onClose={() => setIsAddQuestionOpen(false)}
        title='Add Question'
      >
        <QuestionForm
          levelId={levelId}
          lessonId={lesson.id}
          onClose={() => setIsAddQuestionOpen(false)}
        />
      </Modal>

      {/* Edit Question Modal */}
      <Modal
        isOpen={isEditQuestionOpen}
        onClose={() => setIsEditQuestionOpen(false)}
        title='Edit Question'
      >
        <QuestionForm
          levelId={levelId}
          lessonId={lesson.id}
          question={selectedQuestion}
          onClose={() => setIsEditQuestionOpen(false)}
        />
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={confirmDelete}
        title={`Delete ${
          deleteType === 'vocabulary' ? 'Vocabulary' : 'Question'
        }`}
        message={`Are you sure you want to delete this ${deleteType}? This action cannot be undone.`}
        confirmText='Delete'
        cancelText='Cancel'
        type='danger'
      />
    </div>
  )
}

export default LessonDetails
