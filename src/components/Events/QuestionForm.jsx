import { zodResolver } from '@hookform/resolvers/zod'
import { Upload } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { uploadImage } from '../../utils/UploadImage'
// import { useChallenge } from '../../context/ChallengeContext'
import PropTypes from 'prop-types'
import LoadingSpinner from '../common/LoadingSpinner'

const QuestionSchema = z.object({
  content: z.string().min(1, {
    message: 'Question content is required',
  }),
  choices: z
    .array(
      z.string().min(1, {
        message: 'Choice cannot be empty',
      })
    )
    .length(3),
  correct_answer: z.string().min(1, {
    message: 'Correct answer is required',
  }),
  image_url: z
    .union([z.instanceof(File), z.string().url(), z.string().length(0)])
    .optional(),
})

const QuestionForm = ({ eventId, question, onClose, setRefreshTrigger }) => {
  // const { addTaskQuestion, updateTaskQuestion } = useChallenge()

  const {
    handleSubmit,
    watch,
    setValue,
    register,

    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(QuestionSchema),
    defaultValues: {
      content: question?.content || '',
      choices: question?.choices || ['', '', ''],
      correct_answer: question?.correct_answer || '',
      image_url: question?.image_url || '',
    },
  })

  const handlecorrectanswerChange = (value) => {
    setValue('correct_answer', value)
  }

  const onSubmit = async (data) => {
    let url = ''
    try {
      if (typeof data.image_url === 'string' && data.image_url.length > 0) {
        url = data.image_url
      } else if (data.image_url instanceof File) {
        url = await uploadImage(data.image_url)
      }
      const dataWithImageUrl = {
        ...data,
        image_url: url,
      }
      if (question) {
        // await updateTaskQuestion(eventId, question.id, dataWithImageUrl)
        toast.success('Task question updated successfully')
        setRefreshTrigger((prev) => !prev)
      } else {
        // await addTaskQuestion(eventId, dataWithImageUrl)
        toast.success('Task question added successfully')
        setRefreshTrigger((prev) => !prev)
      }
      onClose()
    } catch (error) {
      console.error('Error submitting question:', error)
      toast.error(error.message || 'Failed to save question')
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className='space-y-4'
    >
      <div>
        <label
          htmlFor='content'
          className='block text-sm font-medium text-gray-700'
        >
          Question
        </label>
        <textarea
          id='content'
          name='content'
          rows='2'
          {...register('content')}
          className={`mt-1 input ${errors.content ? 'border-red-500' : ''}`}
        />
        {errors.content?.message && (
          <p className='mt-1 text-sm text-red-500'>{errors.content.message}</p>
        )}
      </div>

      <div>
        <label className='block text-sm font-medium text-gray-700 mb-2'>
          Choices
        </label>
        <div className='space-y-3'>
          {watch('choices').map((choice, index) => (
            <div
              key={index}
              className='flex items-center space-x-2'
            >
              <input
                value={0}
                type='radio'
                id={`correct-${index}`}
                name='correct_answer'
                checked={watch('correct_answer') === choice}
                onChange={() => handlecorrectanswerChange(choice)}
                className='h-4 w-4 text-primary focus:ring-primary border-gray-300'
              />
              <input
                type='text'
                {...register(`choices.${index}`)}
                placeholder={`Choice ${index + 1}`}
                className={`input ${
                  errors.choices?.[index] ? 'border-red-500' : ''
                }`}
              />
            </div>
          ))}
        </div>
        {errors.choices && (
          <p className='mt-1 text-sm text-red-500'>{errors.choices.message}</p>
        )}
        {errors.correct_answer && (
          <p className='mt-1 text-sm text-red-500'>
            {errors.correct_answer.message}
          </p>
        )}
      </div>

      <div>
        <div className='mt-4'>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            Image
          </label>
          <input
            type='text'
            placeholder='Enter image URL'
            {...register('image_url')}
            className={`mb-2 input w-full ${
              errors.image_url?.message ? 'border-red-500' : ''
            }`}
          />
          <label
            htmlFor={'image'}
            className='relative cursor-pointer flex items-center justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md'
          >
            <div className='space-y-1 text-center justify-center'>
              <Upload
                color='black'
                className='mx-auto'
              />
              <div className='flex text-sm text-gray-600'>
                <p className='mx-auto  cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500'>
                  <span>Upload a Image</span>
                </p>
              </div>
              <p className='text-xs text-gray-500'>PNG, JPG up to 10MB</p>
            </div>
            <input
              type='file'
              id='image'
              name='image'
              accept='image/*'
              onChange={(e) => {
                const file = e.target.files?.[0]
                const currentUrl = watch('image_url')
                if (
                  file &&
                  (typeof currentUrl !== 'string' || currentUrl.trim() === '')
                ) {
                  setValue('image_url', file)
                }
              }}
              className='sr-only'
            />
          </label>
        </div>
        {errors.image_url?.message && (
          <p className='mt-1 text-sm text-red-500'>
            {errors.image_url?.message}
          </p>
        )}

        {watch('image_url') && (
          <div className='mt-2'>
            <p className='text-sm text-gray-500 mb-1'>Image Preview:</p>
            <img
              src={
                typeof watch('image_url') === 'string' &&
                watch('image_url').length > 0
                  ? watch('image_url')
                  : watch('image_url') instanceof File
                  ? URL.createObjectURL(watch('image_url'))
                  : ''
              }
              alt='Preview'
              className='h-40 w-40 object-cover rounded border border-gray-300'
            />
          </div>
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
          className={` ${isSubmitting ? ' btn-disabled' : 'btn btn-primary'}  `}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <div className='flex'>
              <LoadingSpinner />
              {question ? 'Updating Question...' : 'Adding Question...'}
            </div>
          ) : question ? (
            'Update Question'
          ) : (
            'Add Question'
          )}
        </button>
      </div>
    </form>
  )
}

export default QuestionForm

QuestionForm.propTypes = {
  onClose: PropTypes.func.isRequired,

  setRefreshTrigger: PropTypes.func.isRequired,

  eventId: PropTypes.string,
  question: PropTypes.shape({
    id: PropTypes.string,
    content: PropTypes.string,
    choices: PropTypes.array,
    correct_answer: PropTypes.string,
    image_url: PropTypes.string,
  }),
}
