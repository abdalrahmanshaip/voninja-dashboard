import { useState, useEffect } from 'react'
import { useChallenge } from '../../context/ChallengeContext'
import { toast } from 'sonner'
import LoadingSpinner from '../common/LoadingSpinner'

const TaskForm = ({ challengeId, task, onClose, setRefreshTrigger }) => {
  const { addTask, updateTask } = useChallenge()
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    title: '',
    numQuestions: 0,
  })
  const [errors, setErrors] = useState({})

  // If editing, populate form with task data
  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        order: task.order,
        numQuestions: task.numQuestions || 0,
      })
    } else {
      setFormData({
        title: '',
        numQuestions: 0,
      })
    }
  }, [task])

  const handleChange = (e) => {
    const { name, value, type } = e.target

    setFormData({
      ...formData,
      [name]: type === 'number' ? parseInt(value, 10) : value,
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
      if (task) {
        await updateTask(challengeId, task.id, formData)
        setRefreshTrigger((prev) => !prev)
        toast.success('Task updated successfully')
      } else {
        await addTask(challengeId, formData)
        setRefreshTrigger((prev) => !prev)
        toast.success('Task added successfully')
      }
      onClose()
    } catch (error) {
      toast.error(error.message || 'An error occurred')
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
          Task Title
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
          className={` ${loading ? ' btn-disabled' : 'btn btn-primary'}  `}
          disabled={loading}
        >
          {loading ? (
            <div className='flex'>
             <LoadingSpinner />
              {task ? 'Updating Task...' : 'Adding Task...'}
            </div>
          ) : task ? (
            'Update Task'
          ) : (
            'Add Task'
          )}
        </button>
      </div>
    </form>
  )
}

export default TaskForm
