import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { useData } from '../../context/DataContext'

const LessonForm = ({ lesson, level, onClose, levelId }) => {
  const { addLesson, updateLesson } = useData()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    level: level,
    lesson_order: 1,
    status: 'UNPUBLISHED',
  })
  const [errors, setErrors] = useState({})

  // If editing, populate form with lesson data
  useEffect(() => {
    if (lesson) {
      setFormData({
        title: lesson.title || '',
        level: lesson.level || level,
        status: lesson.status || 'UNPUBLISHED',
      })
    } else {
      setFormData({
        title: '',
        level: level,
        status: 'UNPUBLISHED',
      })
    }
  }, [lesson, level, levelId])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: name === 'order' ? parseInt(value, 10) : value,
    })

    // Clear error for this field
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null,
      })
    }
  }

  const validate = () => {
    const newErrors = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validate()) return

    setLoading(true)
    try {
      if (lesson) {
        await updateLesson(levelId, lesson.id, formData)
        toast.success('Lesson updated successfully!')
      } else {
        await addLesson(levelId, formData)
        toast.success('Lesson added successfully!')
      }
      onClose()
    } catch (error) {
      console.error('Error submitting lesson:', error)
      toast.error('Failed to save lesson. Please try again.')
    } finally {
      setLoading(false)
    }
  }
  return (
    <form
      onSubmit={handleSubmit}
      className='space-y-4'
    >
      <div>
        <label
          htmlFor='title'
          className='block text-sm font-medium text-gray-700'
        >
          Lesson Title
        </label>
        <input
          type='text'
          id='title'
          name='title'
          value={formData.title}
          onChange={handleChange}
          className={`mt-1 input ${errors.title ? 'border-red-500' : ''}`}
        />
        {errors.title && (
          <p className='mt-1 text-sm text-red-500'>{errors.title}</p>
        )}
      </div>

      <div>
        <label
          htmlFor='level'
          className='block text-sm font-medium text-gray-700'
        >
          Level
        </label>

        <select
          id='level'
          name='level'
          value={formData.level}
          onChange={handleChange}
          className='mt-1 select'
          disabled={level ? true : false}
        >
          <option value='Basic'>Basic</option>
          <option value='Intermediate'>Intermediate</option>
          <option value='Advanced'>Advanced</option>
        </select>
      </div>

      <div className='flex justify-end mt-6 space-x-3'>
        <button
          type='button'
          onClick={onClose}
          className='btn btn-ghost'
        >
          Cancel
        </button>
        <button
          type='submit'
          className={` ${
            loading ? ' btn bg-gray-400 pointer-events-auto' : 'btn btn-primary'
          }  `}
          disabled={loading}
        >
          {loading ? (
            <div className='flex'>
              <svg
                className='animate-spin h-5 w-5 mr-2'
                xmlns='http://www.w3.org/2000/svg'
                fill='none'
                viewBox='0 0 24 24'
              >
                <circle
                  className='opacity-25'
                  cx='12'
                  cy='12'
                  r='10'
                  stroke='currentColor'
                  strokeWidth='4'
                ></circle>
                <path
                  className='opacity-75'
                  fill='currentColor'
                  d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                ></path>
              </svg>
              {lesson ? 'Updating Lesson...' : 'Adding Lesson...'}
            </div>
          ) : lesson ? (
            'Update Lesson'
          ) : (
            'Add Lesson'
          )}
        </button>
      </div>
    </form>
  )
}

export default LessonForm
