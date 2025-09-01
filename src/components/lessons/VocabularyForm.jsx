import { zodResolver } from '@hookform/resolvers/zod'
import { Upload } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { useData } from '../../context/DataContext'
import { uploadImage } from '../../utils/UploadImage'
import LoadingSpinner from '../common/LoadingSpinner'

const VocabularySchema = z.object({
  word: z.string().min(1, {
    message: 'word must be at least 1 characters.',
  }),
  translated_word: z.string().min(1, {
    message: 'translated word must be at least 1 characters.',
  }),
  statement_example: z.string().min(1, {
    message: 'English statement must be at least 1 characters.',
  }),
  translated_statement_example: z.string().min(1, {
    message: 'Arabic statement must be at least 1 characters.',
  }),
  image_url: z
    .union([z.instanceof(File), z.string().url(), z.string().length(0)])
    .optional(),
})
const VocabularyForm = ({ levelId, lessonId, vocabulary, onClose }) => {
  const {
    handleSubmit,
    watch,
    setValue,
    register,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(VocabularySchema),
    defaultValues: {
      word: vocabulary?.word || '',
      translated_word: vocabulary?.translated_word || '',
      statement_example: vocabulary?.statement_example || '',
      translated_statement_example:
        vocabulary?.translated_statement_example || '',
      image_url: vocabulary?.image_url || '',
    },
  })

  const watchIamge = watch('image_url')
  const { addVocabulary, updateVocabulary } = useData()
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
      if (vocabulary) {
        await updateVocabulary(
          levelId,
          lessonId,
          vocabulary.id,
          dataWithImageUrl
        )
        toast.success('Vocabulary updated successfully')
      } else {
        await addVocabulary(levelId, lessonId, dataWithImageUrl)
        toast.success('Vocabulary added successfully')
      }
      onClose()
    } catch (error) {
      console.error('Error submitting vocabulary:', error)
      toast.error(error.message || 'Failed to save vocabulary')
    }
  }
  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className='space-y-4'
    >
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
        <div>
          <label
            htmlFor='word'
            className='block text-sm font-medium text-gray-700'
          >
            Word
          </label>
          <input
            type='text'
            id='word'
            name='word'
            {...register('word')}
            className={`mt-1 input ${
              errors.word?.message ? 'border-red-500' : ''
            }`}
          />
          {errors.word?.message && (
            <p className='mt-1 text-sm text-red-500'>{errors.word?.message}</p>
          )}
        </div>

        <div>
          <label
            htmlFor='translated_word'
            className='block text-sm font-medium text-gray-700'
          >
            Translated Word
          </label>
          <input
            type='text'
            id='translated_word'
            name='translated_word'
            {...register('translated_word')}
            className={`mt-1 input ${
              errors.translated_word?.message ? 'border-red-500' : ''
            }`}
          />
          {errors.translated_word?.message && (
            <p className='mt-1 text-sm text-red-500'>
              {errors.translated_word?.message}
            </p>
          )}
        </div>
      </div>
      <div>
        <label
          htmlFor='statement_example'
          className='block text-sm font-medium text-gray-700'
        >
          English Statement
        </label>
        <input
          type='text'
          id='statement_example'
          name='statement_example'
          {...register('statement_example')}
          className={`mt-1 input ${
            errors.statement_example?.message ? 'border-red-500' : ''
          }`}
        />
        {errors.statement_example?.message && (
          <p className='mt-1 text-sm text-red-500'>
            {errors.statement_example?.message}
          </p>
        )}
      </div>
      <div>
        <label
          htmlFor='translated_statement_example'
          className='block text-sm font-medium text-gray-700'
        >
          Arabic Statement
        </label>
        <input
          type='text'
          id='translated_statement_example'
          name='translated_statement_example'
          {...register('translated_statement_example')}
          className={`mt-1 input ${
            errors.translated_statement_example?.message ? 'border-red-500' : ''
          }`}
        />
        {errors.translated_statement_example?.message && (
          <p className='mt-1 text-sm text-red-500'>
            {errors.translated_statement_example?.message}
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

        {watchIamge && (
          <div className='mt-2'>
            <p className='text-sm text-gray-500 mb-1'>Image Preview:</p>
            <img
              src={
                typeof watchIamge === 'string' && watchIamge.length > 0
                  ? watchIamge
                  : watchIamge instanceof File
                  ? URL.createObjectURL(watchIamge)
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
              {vocabulary ? 'Updating Vocabulary...' : 'Adding Vocabulary...'}
            </div>
          ) : vocabulary ? (
            'Update Vocabulary'
          ) : (
            'Add Vocabulary'
          )}
        </button>
      </div>
    </form>
  )
}

export default VocabularyForm
