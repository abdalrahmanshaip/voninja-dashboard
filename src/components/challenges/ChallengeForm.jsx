import { Firestore } from 'firebase/firestore'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { useChallenge } from '../../context/ChallengeContext'
import { formatDateLocal } from '../../utils/dateFormat'

const ChallengeForm = ({ challenge, onClose }) => {
  const { addChallenge, updateChallenge } = useChallenge()
  const [formData, setFormData] = useState({
    title: '',
    endTime: null,
    deductionPoints: 0,
    rewardPoints: 0,
    subscriptionPoints: 0,
    rewards: {
      first: 0,
      second: 0,
      third: 0,
    },
  })
  const [errors, setErrors] = useState({})

  // If editing, populate form with challenge data
  useEffect(() => {
    if (challenge) {
      setFormData({
        title: challenge.title || '',
        endTime: formatDateLocal(new Date(challenge.endTime.seconds * 1000)),
        deducePoints: challenge.deducePoints || 5,
        rewardPoints: challenge.rewardPoints || 20,
        subscriptionPoints: challenge.subscriptionPoints || 100,
        rewards: {
          additionalProp1: challenge.rewards?.additionalProp1 || 500,
          additionalProp2: challenge.rewards?.additionalProp2 || 300,
          additionalProp3: challenge.rewards?.additionalProp3 || 150,
        },
      })
    } else {
      setFormData({
        title: '',
        endTime: new Date().toISOString().slice(0, 16),
        deducePoints: 5,
        rewardPoints: 20,
        subscriptionPoints: 100,
        rewards: {
          additionalProp1: 500,
          additionalProp2: 300,
          additionalProp3: 150,
        },
      })
    }
  }, [challenge])

  const handleChange = (e) => {
    const { name, value, type } = e.target

    // Handle numeric fields
    if (type === 'number') {
      setFormData({
        ...formData,
        [name]: parseInt(value, 10),
      })
    } else {
      setFormData({
        ...formData,
        [name]: value,
      })
    }

    // Clear error for this field
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null,
      })
    }
  }

  const handleRewardChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      rewards: {
        ...formData.rewards,
        [name]: parseInt(value, 10),
      },
    })

    // Clear error for this field
    if (errors[`rewards.${name}`]) {
      setErrors({
        ...errors,
        [`rewards.${name}`]: null,
      })
    }
  }

  const validate = () => {
    const newErrors = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required'
    }

    if (!formData.endTime) {
      newErrors.endTime = 'End time is required'
    } else if (new Date(formData.endTime) <= new Date()) {
      newErrors.endTime = 'End time must be in the future'
    }

    if (formData.deducePoints < 0) {
      newErrors.deductionPoints = 'Deduction points must be a positive number'
    }

    if (formData.rewardPoints < 0) {
      newErrors.rewardPoints = 'Reward points must be a positive number'
    }

    if (formData.subscriptionPoints < 0) {
      newErrors.subscriptionPoints =
        'Subscription points must be a positive number'
    }

    if (formData.rewards.additionalProp1 < 0) {
      newErrors['rewards.additionalProp1'] =
        '1st place reward must be a positive number'
    }

    if (formData.rewards.additionalProp2 < 0) {
      newErrors['rewards.additionalProp2'] =
        '2nd place reward must be a positive number'
    }

    if (formData.rewards.additionalProp3 < 0) {
      newErrors['rewards.additionalProp3'] =
        '3rd place reward must be a positive number'
    }

    // Validate that rewards are in decreasing order
    if (formData.rewards.additionalProp2 > formData.rewards.additionalProp1) {
      newErrors['rewards.additionalProp2'] =
        '2nd place reward must be less than 1st place'
    }

    if (formData.rewards.additionalProp3 > formData.rewards.additionalProp2) {
      newErrors['rewards.additionalProp3'] =
        '3rd place reward must be less than 2nd place'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validate()) return

    // Prepare data to submit
    const submitData = {
      ...formData,
      endTime: formData.endTime.seconds
        ? new Firestore.Timestamp(
            formData.endTime.seconds,
            formData.endTime.nanoseconds
          )
        : new Date(formData.endTime),
    }

    try {
      if (challenge) {
        await updateChallenge(challenge.id, submitData)
        toast.success('Challenge updated successfully')
      } else {
        await addChallenge(submitData)
        toast.success('Challenge added successfully')
      }
      onClose()
    } catch (error) {
      console.error('Error handling challenge:', error)
      toast.error(error.message || 'Failed to save challenge')
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
          Challenge Title
        </label>
        <input
          type='text'
          id='title'
          name='title'
          defaultValue={formData.title || ''}
          onChange={handleChange}
          className={`mt-1 input ${errors.title ? 'border-red-500' : ''}`}
        />
        {errors.title && (
          <p className='mt-1 text-sm text-red-500'>{errors.title}</p>
        )}
      </div>

      <div>
        <label
          htmlFor='endTime'
          className='block text-sm font-medium text-gray-700'
        >
          End Time
        </label>
        <input
          type='datetime-local'
          id='endTime'
          name='endTime'
          defaultValue={formData.endTime || ''}
          onChange={handleChange}
          className={`mt-1 input ${errors.endTime ? 'border-red-500' : ''}`}
        />
        {errors.endTime && (
          <p className='mt-1 text-sm text-red-500'>{errors.endTime}</p>
        )}
      </div>

      <div className='grid grid-cols-1 gap-4 sm:grid-cols-3'>
        <div>
          <label
            htmlFor='rewardPoints'
            className='block text-sm font-medium text-gray-700'
          >
            Reward Points (+)
          </label>
          <input
            type='number'
            id='rewardPoints'
            name='rewardPoints'
            min='0'
            defaultValue={formData.rewardPoints || ''}
            onChange={handleChange}
            className={`mt-1 input ${
              errors.rewardPoints ? 'border-red-500' : ''
            }`}
          />
          {errors.rewardPoints && (
            <p className='mt-1 text-sm text-red-500'>{errors.rewardPoints}</p>
          )}
        </div>

        <div>
          <label
            htmlFor='deducePoints'
            className='block text-sm font-medium text-gray-700'
          >
            Deduction Points (-)
          </label>
          <input
            type='number'
            id='deducePoints'
            name='deducePoints'
            min='0'
            defaultValue={formData.deducePoints || ''}
            onChange={handleChange}
            className={`mt-1 input ${
              errors.deducePoints ? 'border-red-500' : ''
            }`}
          />
          {errors.deducePoints && (
            <p className='mt-1 text-sm text-red-500'>{errors.deducePoints}</p>
          )}
        </div>

        <div>
          <label
            htmlFor='subscriptionPoints'
            className='block text-sm font-medium text-gray-700'
          >
            Required Points to Join
          </label>
          <input
            type='number'
            id='subscriptionPoints'
            name='subscriptionPoints'
            min='0'
            defaultValue={formData.subscriptionPoints || ''}
            onChange={handleChange}
            className={`mt-1 input ${
              errors.subscriptionPoints ? 'border-red-500' : ''
            }`}
          />
          {errors.subscriptionPoints && (
            <p className='mt-1 text-sm text-red-500'>
              {errors.subscriptionPoints}
            </p>
          )}
        </div>
      </div>

      <div>
        <h3 className='text-sm font-medium text-gray-700 mb-2'>
          Top 3 Rank Rewards
        </h3>
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-3'>
          <div>
            <label
              htmlFor='additionalProp1'
              className='block text-sm text-gray-500'
            >
              1st Place
            </label>
            <input
              type='number'
              id='additionalProp1'
              name='additionalProp1'
              min='0'
              defaultValue={formData.rewards.additionalProp1 || ''}
              onChange={handleRewardChange}
              className={`mt-1 input ${
                errors['rewards.additionalProp1'] ? 'border-red-500' : ''
              }`}
            />
            {errors['rewards.additionalProp1'] && (
              <p className='mt-1 text-sm text-red-500'>
                {errors['rewards.additionalProp1']}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor='additionalProp2'
              className='block text-sm text-gray-500'
            >
              2nd Place
            </label>
            <input
              type='number'
              id='additionalProp2'
              name='additionalProp2'
              min='0'
              defaultValue={formData.rewards.additionalProp2 || ''}
              onChange={handleRewardChange}
              className={`mt-1 input ${
                errors['rewards.additionalProp2'] ? 'border-red-500' : ''
              }`}
            />
            {errors['rewards.additionalProp2'] && (
              <p className='mt-1 text-sm text-red-500'>
                {errors['rewards.additionalProp2']}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor='additionalProp3'
              className='block text-sm text-gray-500'
            >
              3rd Place
            </label>
            <input
              type='number'
              id='additionalProp3'
              name='additionalProp3'
              min='0'
              defaultValue={formData.rewards.additionalProp3 || ''}
              onChange={handleRewardChange}
              className={`mt-1 input ${
                errors['rewards.additionalProp3'] ? 'border-red-500' : ''
              }`}
            />
            {errors['rewards.additionalProp3'] && (
              <p className='mt-1 text-sm text-red-500'>
                {errors['rewards.additionalProp3']}
              </p>
            )}
          </div>
        </div>
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
          {challenge ? 'Update Challenge' : 'Add Challenge'}
        </button>
      </div>
    </form>
  )
}

export default ChallengeForm
