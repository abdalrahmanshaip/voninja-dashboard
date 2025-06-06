import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { useData } from '../../context/DataContext'

const LessonForm = ({ lesson, level, onClose, levelId }) => {
  const { addLesson, updateLesson } = useData()
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
          className='btn btn-primary'
        >
          {lesson ? 'Update Lesson' : 'Add Lesson'}
        </button>
      </div>
    </form>
  )
}

export default LessonForm
