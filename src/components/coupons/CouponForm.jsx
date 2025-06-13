import { useEffect, useState } from 'react'
import { useCoupon } from '../../context/CouponContext'
import { formatDateLocal } from '../../utils/dateFormat'
import { Firestore } from 'firebase/firestore'
import { toast } from 'sonner'

const CouponForm = ({ coupon, onClose }) => {
  const { addCoupon, updateCoupon } = useCoupon()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    points: null,
    expireDate: null,
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (coupon) {
      setFormData({
        id: coupon.id || '',
        points: coupon.points || 0,
        expireDate: formatDateLocal(new Date(coupon.expireDate.seconds * 1000)),
      })
    } else {
      setFormData({
        points: 0,
        expireDate: new Date().toISOString().slice(0, 16),
      })
    }
  }, [coupon])

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

  const validate = () => {
    const newErrors = {}

    // if (!formData.id.trim()) {
    //   newErrors.content = 'Coupon code is required'
    // }

    if (!formData.points || formData.points <= 0) {
      newErrors.pointValue = 'Point value must be greater than 0'
    }

    if (!formData.expireDate) {
      newErrors.expireDate = 'Expiration date is required'
    } else if (new Date(formData.expireDate) <= new Date()) {
      newErrors.expireDate = 'Expiration date must be in the future'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validate()) return

    setLoading(true)
    try {
      const submitData = {
        ...formData,
        expireDate: formData.expireDate.seconds
          ? new Firestore.Timestamp(
              formData.expireDate.seconds,
              formData.expireDate.nanoseconds
            )
          : new Date(formData.expireDate),
      }

      if (coupon) {
        await updateCoupon(coupon.id, submitData)
        toast.success('Coupon updated successfully')
      } else {
        await addCoupon(submitData)
        toast.success('Coupon created successfully')
      }

      onClose()
    } catch (error) {
      console.error('Error submitting coupon:', error)
      toast.error('Failed to save coupon. Please try again.')
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
          htmlFor='points'
          className='block text-sm font-medium text-gray-700'
        >
          Point Value
        </label>
        <input
          type='number'
          id='points'
          name='points'
          min='1'
          defaultValue={formData.points}
          onChange={handleChange}
          className={`mt-1 input ${errors.points ? 'border-red-500' : ''}`}
        />
        {errors.points && (
          <p className='mt-1 text-sm text-red-500'>{errors.points}</p>
        )}
      </div>

      <div>
        <div>
          <label
            htmlFor='endTime'
            className='block text-sm font-medium text-gray-700'
          >
            Expiration Date
          </label>
          <input
            type='datetime-local'
            id='expireDate'
            name='expireDate'
            defaultValue={formData.expireDate}
            onChange={handleChange}
            className={`mt-1 input ${
              errors.expireDate ? 'border-red-500' : ''
            }`}
          />
          {errors.expireDate && (
            <p className='mt-1 text-sm text-red-500'>{errors.expireDate}</p>
          )}
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
              {coupon ? 'Updating Coupon...' : 'Adding Coupon...'}
            </div>
          ) : coupon ? (
            'Update Coupon'
          ) : (
            'Add Coupon'
          )}
        </button>
      </div>
    </form>
  )
}

export default CouponForm
