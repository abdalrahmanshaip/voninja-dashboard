import { Upload } from 'lucide-react'
import PropTypes from 'prop-types'
import { useCreateEvent } from '../../hooks/useCreateEvent'
import LoadingSpinner from '../common/LoadingSpinner'

const SharedEventForm = ({ event, activeTab, onClose }) => {
  const basicSubType = event ? event.type : 'target_points'
  
  const {
    errors,
    handleSubmit,
    onSubmit,
    register,
    setValue,
    watch,
    isSubmitting,
  } = useCreateEvent(activeTab, basicSubType, event, onClose)


  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className='space-y-6'
    >
      <div className='space-y-4'>
        <div className='flex flex-1 gap-4'>
          <div className='w-full'>
            <label
              htmlFor='title'
              className='block text-sm font-medium text-gray-700'
            >
              Title
            </label>

            <input
              type='text'
              id='title'
              name='title'
              className={`mt-1 input ${errors.title ? 'border-red-500' : ''}`}
              {...register('title')}
            />
            {errors.title && (
              <p className='mt-1 text-sm text-red-600'>
                {errors.title.message}
              </p>
            )}
          </div>

          <div className='w-full'>
            <label
              htmlFor='description'
              className='block text-sm font-medium text-gray-700'
            >
              Description
            </label>
            <textarea
              id='description'
              name='description'
              rows='1'
              className={`mt-1 input min-h-[38px] ${
                errors.description ? 'border-red-500' : ''
              }`}
              {...register('description')}
            />
            {errors.description && (
              <p className='mt-1 text-sm text-red-500'>
                {errors.description.message}
              </p>
            )}
          </div>
        </div>

        {!(activeTab == 'basic' && basicSubType == 'welcome') && (
          <div className='flex flex-1 gap-4'>
            <div className='w-full'>
              <label
                htmlFor='startAt'
                className='block text-sm font-medium text-gray-700'
              >
                Start Date
              </label>
              <input
                type='datetime-local'
                id='startAt'
                name='startAt'
                className={`mt-1 input ${
                  errors.startAt ? 'border-red-500' : ''
                }`}
                {...register('startAt', { valueAsDate: true })}
              />
              {errors.startAt && (
                <p className='mt-1 text-sm text-red-600'>
                  {errors.startAt.message}
                </p>
              )}
            </div>

            <div className='w-full'>
              <label
                htmlFor='endAt'
                className='block text-sm font-medium text-gray-700'
              >
                End Date
              </label>
              <input
                type='datetime-local'
                id='endAt'
                name='endAt'
                className={`mt-1 input ${errors.endAt ? 'border-red-500' : ''}`}
                {...register('endAt', { valueAsDate: true })}
              />
              {errors.endAt && (
                <p className='mt-1 text-sm text-red-600'>
                  {errors.endAt.message}
                </p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'double' && (
          <div>
            <label
              htmlFor='multiplier'
              className='block text-sm font-medium text-gray-700'
            >
              Points Multiplier
            </label>
            <input
              id='multiplier'
              type='number'
              min='1'
              minLength={1}
              className={`mt-1 input ${
                errors.rules?.multiplier ? 'border-red-500' : ''
              }`}
              {...register('rules.multiplier', { valueAsNumber: true })}
            />

            {errors.rules?.multiplier && (
              <p className='mt-1 text-sm text-red-600'>
                {errors.rules.multiplier.message}
              </p>
            )}
          </div>
        )}

        {activeTab === 'challenge' && (
          <>
            <div>
              <label className='block text-sm font-medium text-gray-700'>
                Minimum Correct Answers
              </label>
              <input
                name='rules.quizMinCorrect'
                type='number'
                min='1'
                className='mt-1 input'
                {...register('rules.quizMinCorrect', { valueAsNumber: true })}
              />
              {errors.rules?.quizMinCorrect && (
                <p className='mt-1 text-sm text-red-600'>
                  {errors.rules.quizMinCorrect.message}
                </p>
              )}
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700'>
                Reward Points
              </label>
              <input
                name='rules.quizReward'
                type='number'
                min='1'
                className='mt-1 input'
                {...register('rules.quizReward', { valueAsNumber: true })}
              />
              {errors.rules?.quizReward && (
                <p className='mt-1 text-sm text-red-600'>
                  {errors.rules.quizReward.message}
                </p>
              )}
            </div>
          </>
        )}

        {activeTab === 'basic' && watch('type') === 'target_points' && (
          <div className='flex flex-1 gap-4'>
            <div className='w-full'>
              <label
                className='block text-sm font-medium text-gray-700'
                htmlFor='targetGoal'
              >
                Target Goal
              </label>
              <input
                id='targetGoal'
                name='rules.targetGoal'
                type='number'
                min='1'
                className='mt-1 input'
                {...register('rules.targetGoal', { valueAsNumber: true })}
              />
              {errors.rules?.targetGoal && (
                <p className='mt-1 text-sm text-red-600'>
                  {errors.rules.targetGoal.message}
                </p>
              )}
            </div>

            <div className='w-full'>
              <label
                className='block text-sm font-medium text-gray-700'
                htmlFor='targetReward'
              >
                Target Reward
              </label>
              <input
                id='targetReward'
                name='rules.targetReward'
                type='number'
                min='1'
                className='mt-1 input'
                {...register('rules.targetReward', { valueAsNumber: true })}
              />
              {errors.rules?.targetReward && (
                <p className='mt-1 text-sm text-red-600'>
                  {errors.rules.targetReward.message}
                </p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'basic' && watch('type') === 'welcome' && (
          <div className='flex flex-1 gap-4'>
            <div className='w-full'>
              <label
                className='block text-sm font-medium text-gray-700'
                htmlFor='welcomeGoal'
              >
                Welcome Goal
              </label>
              <input
                id='welcomeGoal'
                name='rules.welcomeGoal'
                type='number'
                min='1'
                className='mt-1 input'
                {...register('rules.welcomeGoal', { valueAsNumber: true })}
              />
              {errors.rules?.welcomeGoal && (
                <p className='mt-1 text-sm text-red-600'>
                  {errors.rules.welcomeGoal.message}
                </p>
              )}
            </div>

            <div className='w-full'>
              <label
                className='block text-sm font-medium text-gray-700'
                htmlFor='welcomeReward'
              >
                Welcome Reward
              </label>
              <input
                id='welcomeReward'
                name='rules.welcomeReward'
                type='number'
                min='1'
                className='mt-1 input'
                {...register('rules.welcomeReward', { valueAsNumber: true })}
              />
              {errors.rules?.welcomeReward && (
                <p className='mt-1 text-sm text-red-600'>
                  {errors.rules.welcomeReward.message}
                </p>
              )}
            </div>
          </div>
        )}

        <div>
          <div className='mt-4'>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Image
            </label>
            <input
              type='text'
              placeholder='Enter image URL'
              {...register('imageUrl')}
              className={`mb-2 input w-full ${
                errors.imageUrl?.message ? 'border-red-500' : ''
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
                  const currentUrl = watch('imageUrl')
                  if (
                    file &&
                    (typeof currentUrl !== 'string' || currentUrl.trim() === '')
                  ) {
                    setValue('imageUrl', file)
                  }
                }}
                className='sr-only'
              />
            </label>
          </div>
          {errors.imageUrl && (
            <p className='mt-1 text-sm text-red-500'>
              {errors.imageUrl?.message}
            </p>
          )}

          {watch('imageUrl') && (
            <div className='mt-2'>
              <p className='text-sm text-gray-500 mb-1'>Image Preview:</p>
              <img
                src={
                  typeof watch('imageUrl') === 'string' &&
                  watch('imageUrl').length > 0
                    ? watch('imageUrl')
                    : watch('imageUrl') instanceof File
                    ? URL.createObjectURL(watch('imageUrl'))
                    : ''
                }
                alt='Preview'
                className='h-40 w-40 object-cover rounded border border-gray-300'
              />
            </div>
          )}
        </div>
      </div>

      <div className='flex justify-end space-x-3'>
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
          {/* Save */}
          {isSubmitting ? (
            <div className='flex'>
              <LoadingSpinner />
              {event ? 'Updating Event...' : 'Creating Event...'}
            </div>
          ) : event ? (
            'Update Event'
          ) : (
            'Create Event'
          )}
        </button>
      </div>
    </form>
  )
}

SharedEventForm.propTypes = {
  event: PropTypes.shape({
    title: PropTypes.string,
    description: PropTypes.string,
    imageUrl: PropTypes.string,
    startAt: PropTypes.shape({
      seconds: PropTypes.oneOfType([PropTypes.func, PropTypes.number]),
    }),
    endAt: PropTypes.shape({
      seconds: PropTypes.oneOfType([PropTypes.func, PropTypes.number]),
    }),
    createdAt: PropTypes.any,
    type: PropTypes.string,
    rules: PropTypes.object,
  }),
  activeTab: PropTypes.oneOf(['basic', 'double', 'challenge']).isRequired,
  onClose: PropTypes.func.isRequired,
}

export default SharedEventForm
