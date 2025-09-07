import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import PropTypes from 'prop-types'
import LoadingSpinner from '../common/LoadingSpinner'

const BoxSchema = z.object({
  tier: z.enum(['bronze', 'silver', 'gold'], {
    errorMap: () => ({ message: 'Tier is required' }),
  }),
  minPoints: z.number().min(1, {
    message: 'Minimum points must be at least 1',
  }),
  minAds: z.number().nullable(),
  rewardPoints: z.number().min(1, {
    message: 'Reward points must be at least 1',
  }),
})

const BoxForm = ({ box, onClose, selectedTier, onSubmit: handleFormSubmit }) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm({
    resolver: zodResolver(BoxSchema),
    defaultValues: {
      tier: selectedTier,
      minPoints: box?.condition?.minPoints || 1,
      minAds: box?.condition?.minAds ?? null,
      rewardPoints: box?.rewardPoints || 1,
    },
  })

  const onSubmit = async (data) => {
    try {
      const boxData = {
        tier: selectedTier,
        minPoints: data.minPoints,
        minAds: data.minAds,
        rewardPoints: data.rewardPoints,
      }
      await handleFormSubmit(boxData)
    } catch (error) {
      console.error('Error submitting box form:', error)
    }
  }

  const handleMinAdsChange = (e) => {
    const value = e.target.value.trim() === '' ? null : Number(e.target.value)
    setValue('minAds', value)
  }

  return (
    <div>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className='space-y-4'
      >
        <div>
          <label
            htmlFor='tier'
            className='block text-sm font-medium text-gray-700'
          >
            Tier
          </label>
          <select
          disabled
            id='tier'
            {...register('tier')}
            className={`mt-1 select ${errors.tier ? 'border-red-500' : ''}`}
          >
            <option value='bronze'>Bronze</option>
            <option value='silver'>Silver</option>
            <option value='gold'>Gold</option>
          </select>
          {errors.tier?.message && (
            <p className='mt-1 text-sm text-red-500'>{errors.tier.message}</p>
          )}
        </div>

        <div>
          <label
            htmlFor='minPoints'
            className='block text-sm font-medium text-gray-700'
          >
            Minimum Points
          </label>
          <input
            type='number'
            id='minPoints'
            {...register('minPoints', { valueAsNumber: true })}
            className={`mt-1 input ${errors.minPoints ? 'border-red-500' : ''}`}
            min='0'
          />
          {errors.minPoints?.message && (
            <p className='mt-1 text-sm text-red-500'>
              {errors.minPoints.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor='minAds'
            className='block text-sm font-medium text-gray-700'
          >
            Minimum Ads (leave empty for no minimum)
          </label>
          <input
            type='number'
            id='minAds'
            {...register('minAds', { valueAsNumber: true })}
            onChange={handleMinAdsChange}
            className={`mt-1 input ${errors.minAds ? 'border-red-500' : ''}`}
            min='0'
          />
          {errors.minAds?.message && (
            <p className='mt-1 text-sm text-red-500'>{errors.minAds.message}</p>
          )}
        </div>

        <div>
          <label
            htmlFor='rewardPoints'
            className='block text-sm font-medium text-gray-700'
          >
            Reward Points
          </label>
          <input
            type='number'
            id='rewardPoints'
            {...register('rewardPoints', { valueAsNumber: true })}
            className={`mt-1 input ${
              errors.rewardPoints ? 'border-red-500' : ''
            }`}
            min='0'
          />
          {errors.rewardPoints?.message && (
            <p className='mt-1 text-sm text-red-500'>
              {errors.rewardPoints.message}
            </p>
          )}
        </div>

        <div className='flex justify-end pt-4 gap-4'>
          <button
            type='button'
            onClick={onClose}
            className='btn btn-ghost'
          >
            Cancel
          </button>

          <button
            type='submit'
            className={`${isSubmitting ? 'btn-disabled' : 'btn btn-primary'}`}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <div className='flex'>
                <LoadingSpinner />
                {box ? 'Updating Box...' : 'Creating Box...'}
              </div>
            ) : box ? (
              'Update Box'
            ) : (
              'Create Box'
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default BoxForm

BoxForm.propTypes = {
  box: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  selectedTier: PropTypes.string,
  onSubmit: PropTypes.func.isRequired,
}
