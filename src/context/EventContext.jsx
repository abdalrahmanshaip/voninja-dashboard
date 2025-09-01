import { zodResolver } from '@hookform/resolvers/zod'
import { Timestamp } from 'firebase/firestore'
import { Upload } from 'lucide-react'
import PropTypes from 'prop-types'
import { Controller, useForm } from 'react-hook-form'
import * as z from 'zod'
import { formatDateLocal } from '../../utils/dateFormat'

const SharedEventForm = ({ event, activeTab, onClose }) => {
  const eventSchema = z
    .object({
      title: z.string().min(1, 'Title is required'),
      description: z.string().min(1, 'Description is required'),
      imageUrl: z
        .union([z.instanceof(File), z.string().url(), z.string().length(0)])
        .optional(),
      startAt: z.coerce
        .date()
        .min(new Date(), { message: 'Start date must be in the future' }),
      endAt: z.coerce.date(),
      type: z.enum(['multiplier', 'quiz', 'welcome', 'target_points']),
      rules: z
        .object({
          ...(activeTab === 'double' && {
            multiplier: z.number().min(1, 'Multiplier must be at least 1'),
          }),
          ...(activeTab === 'challenge' && {
            questionsCount: z.number().min(1, 'Must have at least 1 question'),
            pointsPerQuestion: z.number().min(1, 'Points must be at least 1'),
          }),
          ...(activeTab === 'basic' &&
            event?.type === 'target_points' && {
              targetGoal: z
                .number()
                .int()
                .min(1, 'Target goal must be at least 1'),
              targetReward: z
                .number()
                .int()
                .min(1, 'Target reward is required'),
            }),
          ...(activeTab === 'basic' &&
            event?.type === 'welcome' && {
              welcomeGoal: z
                .number()
                .int()
                .min(1, 'Welcome goints must be at least 1'),
              welcomeReward: z
                .number()
                .int()
                .min(1, 'Welcome reward is required'),
            }),
        })
        .optional(),
    })
    .refine((data) => data.endAt > data.startAt, {
      message: 'End date must be after start date',
      path: ['endAt'],
    })

  const {
    control,
    handleSubmit,
    register,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: event?.title || '',
      description: event?.description || '',
      imageUrl: event?.imageUrl || '',
      startAt: formatDateLocal(new Date(event?.startAt?.seconds * 1000)) || '',
      endAt: formatDateLocal(new Date(event?.endAt?.seconds * 1000)) || '',
      type:
        event?.type ||
        (activeTab === 'double'
          ? 'multiplier'
          : activeTab === 'challenge'
          ? 'quiz'
          : activeTab === 'basic' && 'welcome'),
      rules: {},
    },
  })
  const onSubmit = (data) => {
    const formData = {
      ...data,
      createdAt: event ? event?.createdAt : Timestamp.fromDate(new Date()),
    }
    console.log('Form Data Submitted:', formData)
  }

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
              {...register('description')}
              className={`mt-1 input ${
                errors.description ? 'border-red-500' : ''
              }`}
            />
            {errors.description && (
              <p className='mt-1 text-sm text-red-500'>
                {errors.description.message}
              </p>
            )}
          </div>
        </div>

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
              className={`mt-1 input ${errors.startAt ? 'border-red-500' : ''}`}
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

        {activeTab === 'basic' && (
          <div>
            <label className='block text-sm font-medium text-gray-700'>
              Event Type
            </label>
            <Controller
              name='type'
              control={control}
              render={({ field }) => (
                <select
                  {...field}
                  className={`mt-1 input ${
                    errors.type ? 'border-red-500' : ''
                  }`}
                >
                  <option value='welcome'>
                    Welcome (This is unlock for new users)
                  </option>
                  <option value='target_points'>
                    Target Points (This is lock for new users)
                  </option>
                </select>
              )}
            />
            {errors.type && (
              <p className='mt-1 text-sm text-red-600'>{errors.type.message}</p>
            )}
          </div>
        )}

        {/* Dynamic rules fields based on event type */}
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
                Number of Questions
              </label>
              <Controller
                name='rules.questionsCount'
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type='number'
                    min='1'
                    className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500'
                  />
                )}
              />
              {errors.rules?.questionsCount && (
                <p className='mt-1 text-sm text-red-600'>
                  {errors.rules.questionsCount.message}
                </p>
              )}
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700'>
                Points per Question
              </label>
              <Controller
                name='rules.pointsPerQuestion'
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type='number'
                    min='1'
                    className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500'
                  />
                )}
              />
              {errors.rules?.pointsPerQuestion && (
                <p className='mt-1 text-sm text-red-600'>
                  {errors.rules.pointsPerQuestion.message}
                </p>
              )}
            </div>
          </>
        )}

        {activeTab === 'basic' && (
          <div className='flex flex-1 gap-4'>
            <div className='w-full'>
              <label
                className='block text-sm font-medium text-gray-700'
                htmlFor='goal'
              >
                {watch('type') === 'target_points'
                  ? 'Target Goal'
                  : 'Welcome Goal'}
              </label>
              <input
                id='goal'
                key={watch('type') === 'target_points' ? true : false}
                name={
                  watch('type') === 'target_points'
                    ? 'rules.targetGoal'
                    : 'rules.welcomeGoal'
                }
                type='number'
                min='1'
                className='mt-1 input'
                {...register(
                  watch('type') === 'target_points'
                    ? 'rules.targetGoal'
                    : 'rules.welcomeGoal',
                  { valueAsNumber: true }
                )}
              />
              {watch('type') === 'target_points'
                ? errors.rules?.targetGoal && (
                    <p className='mt-1 text-sm text-red-600'>
                      {errors.rules.targetGoal.message}
                    </p>
                  )
                : errors.rules?.welcomeGoal && (
                    <p className='mt-1 text-sm text-red-600'>
                      {errors.rules.welcomeGoal.message}
                    </p>
                  )}
            </div>

            <div className='w-full'>
              <label
                className='block text-sm font-medium text-gray-700'
                htmlFor='reward'
              >
                {watch('type') === 'target_points'
                  ? 'Target Reward'
                  : 'Welcome Reward'}
              </label>

              <input
                id='reward'
                key={watch('type') === 'target_points' ? true : false}
                name={
                  watch('type') === 'target_points'
                    ? 'rules.targetReward'
                    : 'rules.welcomeReward'
                }
                type='number'
                min='1'
                className='mt-1 input'
                {...register(
                  watch('type') === 'target_points'
                    ? 'rules.targetReward'
                    : 'rules.welcomeReward',
                  { valueAsNumber: true }
                )}
              />

              {watch('type') === 'target_points'
                ? errors.rules?.targetReward && (
                    <p className='mt-1 text-sm text-red-600'>
                      {errors.rules.targetReward.message}
                    </p>
                  )
                : errors.rules?.welcomeReward && (
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
          className='px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
        >
          Cancel
        </button>
        <button
          type='submit'
          className='px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
        >
          Save
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
      seconds: PropTypes.func,
    }),
    endAt: PropTypes.shape({
      seconds: PropTypes.func,
    }),
    createdAt: PropTypes.any,
    type: PropTypes.string,
    rules: PropTypes.object,
  }),
  activeTab: PropTypes.oneOf(['basic', 'double', 'challenge']).isRequired,
  onClose: PropTypes.func.isRequired,
}

export default SharedEventForm
