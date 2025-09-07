import { zodResolver } from '@hookform/resolvers/zod'
import { Timestamp } from 'firebase/firestore'
import { Upload } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { useLibrary } from '../../context/LibraryContext'
import { uploadImage } from '../../utils/UploadImage'

const LibrarySchema = z.object({
  title: z.string().min(1, { message: 'Title is required' }),
  requiredPoint: z.string().min(1, { message: 'Required points is required' }),
  url: z
    .union([z.instanceof(File), z.string().url(), z.string().length(0)])
    .optional(),
})

const LibraryForm = ({ item, onClose, onSuccess }) => {
  const isEdit = !!item
  const { addLibraryItem, updateLibraryItem } = useLibrary()

  const {
    handleSubmit,
    watch,
    setValue,
    register,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(LibrarySchema),
    defaultValues: {
      title: item?.title || '',
      requiredPoint: item?.requiredPoint?.toString() || '',
      url: item?.url || '',
    },
  })

  const onSubmit = async (data) => {
    let finalUrl = ''

    try {
      if (typeof data.url === 'string' && data.url.length > 0) {
        finalUrl = data.url
      } else if (data.url instanceof File) {
        finalUrl = await uploadImage(data.url)
      }

      const payload = {
        title: data.title,
        requiredPoint: Number(data.requiredPoint),
        url: finalUrl,
        createdAt: isEdit ? item?.createdAt : Timestamp.fromDate(new Date()), 
      }

      if (isEdit) {
        await updateLibraryItem(item.id, payload)
        toast.success('Library item updated successfully')
      } else {
        await addLibraryItem(payload)
        toast.success('Library item added successfully')
      }

      onClose()
      onSuccess?.()
    } catch (error) {
      console.error('LibraryForm submit error:', error)
      toast.error(error.message || 'Failed to save library item')
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className='space-y-4'
    >
      <div>
        <label className='block text-sm font-medium text-gray-700'>Title</label>
        <textarea
          type='text'
          {...register('title')}
          className={`input mt-1 w-full ${
            errors.title ? 'border-red-500' : ''
          }`}
        />
        {errors.title && (
          <p className='text-sm text-red-500'>{errors.title.message}</p>
        )}
      </div>

      <div>
        <label className='block text-sm font-medium text-gray-700'>
          Required Points
        </label>
        <input
          type='number'
          {...register('requiredPoint')}
          className={`input mt-1 w-full ${
            errors.requiredPoint ? 'border-red-500' : ''
          }`}
        />
        {errors.requiredPoint && (
          <p className='text-sm text-red-500'>{errors.requiredPoint.message}</p>
        )}
      </div>

      <div>
        <label className='block text-sm font-medium text-gray-700 mb-2'>
          PDF URL
        </label>
        <input
          type='text'
          placeholder='Enter PDF URL'
          {...register('url')}
          className={`mb-2 input w-full ${errors.url ? 'border-red-500' : ''}`}
        />
        <label
          htmlFor='file'
          className='relative cursor-pointer flex items-center justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md'
        >
          <div className='space-y-1 text-center'>
            <Upload
              className='mx-auto'
              color='gray'
            />
            <p className='text-sm text-indigo-600 font-medium'>Upload PDF</p>
            <p className='text-xs text-gray-500'>PDF up to 10MB</p>
          </div>
          <input
            type='file'
            id='file'
            accept='application/pdf'
            onChange={(e) => {
              const file = e.target.files?.[0]
              const currentUrl = watch('url')
              if (file && (!currentUrl || typeof currentUrl !== 'string')) {
                setValue('url', file)
              }
            }}
            className='sr-only'
          />
        </label>
        {errors.url?.message && (
          <p className='text-sm text-red-500'>{errors.url.message}</p>
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
          className={`btn ${isSubmitting ? 'bg-gray-400' : 'btn-primary'}`}
        >
          {isSubmitting
            ? isEdit
              ? 'Updating...'
              : 'Adding...'
            : isEdit
            ? 'Update Library Item'
            : 'Add Library Item'}
        </button>
      </div>
    </form>
  )
}

export default LibraryForm
