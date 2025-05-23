import { useState, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useData } from '../../context/DataContext'
import { toast } from 'sonner'
import { Upload } from 'lucide-react'
import { uploadImage } from '../../utils/UploadImage'

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
  correctAnswer: z.string().min(1, {
    message: 'Correct answer is required',
  }),
  image: z.instanceof(File).or(z.string().url()).optional(),
})

const QuestionForm = ({
  lessonId,
  question,
  onClose,
  levelId = { levelId },
}) => {
  const { addQuestion, updateQuestion } = useData()

  const {
    handleSubmit,
    watch,
    setValue,
    register,
    isSubmitting,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(QuestionSchema),
    defaultValues: {
      content: question?.content || '',
      choices: question?.choices || ['', '', ''],
      correctAnswer: question?.correctAnswer || '',
      image: question?.image || '',
    },
  })

  const handleCorrectAnswerChange = (value) => {
    setValue('correctAnswer', value)
  }

  const onSubmit = async (data) => {
    try {
      const url = await uploadImage(data.image)
      const dataWithImageUrl = {
        ...data,
        image: url,
      }
      if (question) {
        await updateQuestion(levelId, lessonId, question.id, dataWithImageUrl)
        toast.success('Question updated successfully')
      } else {
        await addQuestion(levelId, lessonId, dataWithImageUrl)
        toast.success('Question added successfully')
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
                type='radio'
                id={`correct-${index}`}
                name='correctAnswer'
                checked={watch('correctAnswer') === choice}
                onChange={() => handleCorrectAnswerChange(choice)}
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
          <p className='mt-1 text-sm text-red-500'>{errors.choices}</p>
        )}
        {errors.correctAnswer && (
          <p className='mt-1 text-sm text-red-500'>{errors.correctAnswer}</p>
        )}
      </div>

      <div>
        <div className='mt-4'>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            Image
          </label>
          <label
            htmlFor={'image_url'}
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
              id='image_url'
              name='image_url'
              accept='image/*'
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) {
                  setValue('image', file)
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

        {watch('image') && (
          <div className='mt-2'>
            <p className='text-sm text-gray-500 mb-1'>Image Preview:</p>
            <img
              src={
                typeof watch('image') !== 'string'
                  ? URL.createObjectURL(watch('image'))
                  : watch('image')
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
          disabled={isSubmitting}
          
          type='submit'
          className='btn btn-primary'
        >
          {question ? 'Update Question' : 'Add Question'}
        </button>
      </div>
    </form>
  )
}

export default QuestionForm
