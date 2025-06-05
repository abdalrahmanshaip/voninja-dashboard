import { doc, increment, updateDoc, writeBatch } from 'firebase/firestore'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { useDebouncedCallback } from 'use-debounce'
import ConfirmDialog from '../components/common/ConfirmDialog'
import Modal from '../components/common/Modal'
import Table from '../components/common/Table'
import LessonDetails from '../components/lessons/LessonDetails'
import LessonForm from '../components/lessons/LessonForm'
import { useData } from '../context/DataContext'
import { db } from '../utils/firebase'

const Lessons = () => {
  const { getLessons, deleteLesson, updateLesson } = useData()
  const levelIds = [
    'FsJrCVNOxFBcOYRigt2X',
    'ZcgxPOIlIWxYqidpCMyB',
    'igIfRF8vzkSEadAWXTUG',
  ]

  const [selectedLevel, setSelectedLevel] = useState('Basic')
  const [lessons, setLessons] = useState([])
  const [selectedLevelId, setSelectedLevelId] = useState(levelIds[0])
  const [selectedLesson, setSelectedLesson] = useState(null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)
  const [lessonToDelete, setLessonToDelete] = useState(null)
  const [changeStatus, setChangeStatus] = useState(null)
  const [allLessons, setAllLessons] = useState([])

  const handleSearch = useDebouncedCallback((value) => {
    const keyword = value.toLowerCase()

    if (!keyword) {
      setLessons(allLessons)
      return
    }

    const filtered = allLessons.filter((lesson) =>
      lesson.title?.toLowerCase().includes(keyword)
    )
    setLessons(filtered)
  }, 400)

  const handleResetSearch = () => {
    setLessons(allLessons)
  }
  const handleLevelChange = (level) => {
    setSelectedLevel(level)
    const index = ['Basic', 'Intermediate', 'Advanced'].indexOf(level)
    setSelectedLevelId(levelIds[index])
  }

  useEffect(() => {
    const fetchLessons = async () => {
      const result = await getLessons(selectedLevelId)
      const lessonsWithCounts = await Promise.all(
        result.lessons.map(async (lesson) => {
          return {
            ...lesson,
          }
        })
      )
      setAllLessons(lessonsWithCounts)
      setLessons(lessonsWithCounts)
    }

    if (selectedLevelId) fetchLessons()
  }, [selectedLevelId, getLessons])

  const handleAddLesson = () => {
    setIsAddModalOpen(true)
  }

  const handleEditLesson = (lesson) => {
    setSelectedLesson(lesson)
    setIsEditModalOpen(true)
  }

  const handleViewDetails = (lesson) => {
    setSelectedLesson(lesson)
    setIsDetailsModalOpen(true)
  }

  const handleDeleteClick = (lesson) => {
    setLessonToDelete(lesson)
    setIsDeleteConfirmOpen(true)
  }

  const handleStatusToggle = async () => {
    if (changeStatus) {
      try {
        const newStatus =
          changeStatus.status === 'PUBLISHED' ? 'UNPUBLISHED' : 'PUBLISHED'
        await updateLesson(selectedLevelId, changeStatus.id, {
          status: newStatus,
        })
        setLessons((prev) =>
          prev.map((lesson) =>
            lesson.id === changeStatus.id
              ? { ...lesson, status: newStatus }
              : lesson
          )
        )
        toast.success(`Lesson status updated to ${newStatus}`)
      } catch (error) {
        console.error('Error updating lesson status:', error)
        toast.error('Failed to update lesson status')
      }
    }
  }

  const handleReorder = async (lesson1, lesson2) => {
    try {
      const tempOrder = lesson1.lesson_order
      lesson1.lesson_order = lesson2.lesson_order
      lesson2.lesson_order = tempOrder

      const batch = writeBatch(db)
      const lesson1Ref = doc(
        db,
        'levels',
        selectedLevelId,
        'lessons',
        lesson1.id
      )
      const lesson2Ref = doc(
        db,
        'levels',
        selectedLevelId,
        'lessons',
        lesson2.id
      )
      batch.update(lesson1Ref, { lesson_order: lesson1.lesson_order })
      batch.update(lesson2Ref, { lesson_order: lesson2.lesson_order })
      await batch.commit()

      setLessons((prevLessons) => {
        const updatedLessons = prevLessons.map((lesson) => {
          if (lesson.id === lesson1.id)
            return { ...lesson, lesson_order: lesson1.lesson_order }
          if (lesson.id === lesson2.id)
            return { ...lesson, lesson_order: lesson2.lesson_order }
          return lesson
        })
        return updatedLessons.sort((a, b) => a.lesson_order - b.lesson_order)
      })

      toast.success('Lessons reordered successfully')
    } catch (error) {
      console.error('Error reordering lessons:', error)
      toast.error('Failed to reorder lessons. Please try again.')
    }
  }

  const confirmDelete = async () => {
    if (lessonToDelete) {
      try {
        await deleteLesson(selectedLevelId, lessonToDelete.id)
        await updateDoc(doc(db, 'levels', selectedLevelId), {
          totalQuestions: increment(-lessonToDelete.questions?.length || 0),
        })
        const updatedLessons = lessons.filter((l) => l.id !== lessonToDelete.id)
        setLessons(updatedLessons)

        toast.success('Lesson deleted successfully')
        setLessonToDelete(null)
        setIsDeleteConfirmOpen(false)
      } catch (error) {
        toast.error('Failed to delete lesson: ' + error.message)
      }
    }
  }

  const columns = [
    { field: 'id', header: 'ID', sortable: true },
    { field: 'title', header: 'Title', sortable: true },
    { field: 'lesson_order', header: 'Order', sortable: true },
    {
      field: 'questions',
      header: 'Questions Count',
      sortable: true,
      render: (row) => row.numQuestions,
    },
    {
      field: 'status',
      header: 'Status',
      sortable: true,
      render: (row) => (
        <button
          onClick={(e) => {
            e.stopPropagation()
            setChangeStatus(row)
          }}
          className={`px-2 py-1 text-sm font-medium rounded-full ${
            row.status === 'PUBLISHED'
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {row.status}
        </button>
      ),
    },
  ]

  const renderActions = (lesson) => (
    <>
      <button
        onClick={(e) => {
          e.stopPropagation()
          handleViewDetails(lesson)
        }}
        className='text-indigo-600 hover:text-indigo-900 focus:outline-none'
      >
        View
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation()
          handleEditLesson(lesson)
        }}
        className='ml-2 text-green-600 hover:text-green-900 focus:outline-none'
      >
        Edit
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation()
          handleDeleteClick(lesson)
        }}
        className='ml-2 text-red-600 hover:text-red-900 focus:outline-none'
      >
        Delete
      </button>
    </>
  )

  return (
    <div className='space-y-6'>
      <div className='flex justify-between items-center'>
        <h1 className='text-2xl font-bold text-gray-900'>Lessons Management</h1>
        <button
          onClick={handleAddLesson}
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
          Add Lesson
        </button>
      </div>

      {/* Level tabs */}
      <div className='border-b border-gray-200'>
        <nav className='-mb-px flex space-x-8'>
          {['Basic', 'Intermediate', 'Advanced'].map((level, index) => (
            <button
              key={index}
              onClick={() => handleLevelChange(level)}
              className={`${
                selectedLevel === level
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm focus:outline-none`}
            >
              {level}
            </button>
          ))}
        </nav>
      </div>

      <form className='flex items-center justify-start w-fit'>
        <input
          id='search'
          type='search'
          placeholder='Search lessons...'
          className='input bg-white text-black w-60'
          onChange={(e) => handleSearch(e.target.value)}
        />
        <button
          type='reset'
          onClick={handleResetSearch}
          className='bg-black hover:bg-black/90 focus:ring-white text-white w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-1.5 text-base font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm '
        >
          Reset
        </button>
      </form>

      {/* Lessons table */}
      <div className='card'>
        <Table
          columns={columns}
          data={Array.isArray(lessons) ? lessons : []}
          actions={renderActions}
          onRowClick={handleViewDetails}
          emptyMessage={`No ${selectedLevel.toLowerCase()} lessons found. Click "Add Lesson" to create one.`}
          initialSortField='order'
          initialSortDirection='asc'
          lessons={lessons}
          onReorder={handleReorder}
        />
      </div>

      {/* Add Lesson Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title='Add New Lesson'
      >
        <LessonForm
          level={selectedLevel}
          onClose={() => setIsAddModalOpen(false)}
          levelId={selectedLevelId}
        />
      </Modal>

      {/* Edit Lesson Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title='Edit Lesson'
      >
        <LessonForm
          lesson={selectedLesson}
          level={selectedLevel}
          onClose={() => setIsEditModalOpen(false)}
          levelId={selectedLevelId}
        />
      </Modal>

      {/* Lesson Details Modal */}
      <Modal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        title='Lesson Details'
        size='xl'
      >
        <LessonDetails
          lesson={selectedLesson}
          onClose={() => setIsDetailsModalOpen(false)}
          level={selectedLevel}
          levelId={selectedLevelId}
        />
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={confirmDelete}
        title='Delete Lesson'
        message='Are you sure you want to delete this lesson? This action cannot be undone.'
        confirmText='Delete'
        cancelText='Cancel'
        type='danger'
      />

      {/* Status Update Dialog */}
      <ConfirmDialog
        isOpen={changeStatus}
        onClose={() => setChangeStatus(false)}
        onConfirm={handleStatusToggle}
        title='Lesson Status'
        message='Are you sure you want to update the status of this lesson?'
        confirmText={
          changeStatus?.status === 'PUBLISHED' ? 'UNPUBLISHED' : 'PUBLISHED'
        }
        cancelText='Cancel'
        type='info'
      />
    </div>
  )
}

export default Lessons
