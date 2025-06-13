import { useState, useEffect } from 'react'
import { useChallenge } from '../../context/ChallengeContext'
import { toast } from 'sonner'

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
