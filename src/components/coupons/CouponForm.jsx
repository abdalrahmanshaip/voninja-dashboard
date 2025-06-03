import { useEffect, useState } from 'react'
import { useCoupon } from '../../context/CouponContext'
import { formatDateLocal } from '../../utils/dateFormat'
import { Firestore } from 'firebase/firestore'

const CouponForm = ({ coupon, onClose }) => {
  const { addCoupon, updateCoupon } = useCoupon()
  const [formData, setFormData] = useState({
    points: 0,
    expireDate: null,
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (coupon) {
      setFormData({
        id: coupon.id || '',
        points: coupon.points || 100,
        expireDate: formatDateLocal(new Date(coupon.expireDate.seconds * 1000)),
      })
    } else {
      setFormData({
        points: 100,
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

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!validate()) return

    // Prepare data to submit
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
      updateCoupon(coupon.id, submitData)
    } else {
      addCoupon(submitData)
    }

    onClose()
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
          className='btn btn-primary'
        >
          {coupon ? 'Update Coupon' : 'Add Coupon'}
        </button>
      </div>
    </form>
  )
}

export default CouponForm
