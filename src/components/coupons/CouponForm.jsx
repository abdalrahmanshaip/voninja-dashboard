import { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';

const CouponForm = ({ coupon, onClose }) => {
  const { addCoupon, updateCoupon } = useData();
  const [formData, setFormData] = useState({
    content: '',
    pointValue: 100,
    expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  });
  const [errors, setErrors] = useState({});

  // If editing, populate form with coupon data
  useEffect(() => {
    if (coupon) {
      setFormData({
        content: coupon.content || '',
        pointValue: coupon.pointValue || 100,
        expirationDate: new Date(coupon.expirationDate).toISOString().slice(0, 10)
      });
    } else {
      setFormData({
        content: '',
        pointValue: 100,
        expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
      });
    }
  }, [coupon]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    
    // Handle numeric fields
    if (type === 'number') {
      setFormData({
        ...formData,
        [name]: parseInt(value, 10)
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
    
    // Clear error for this field
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.content.trim()) {
      newErrors.content = 'Coupon code is required';
    }
    
    if (!formData.pointValue || formData.pointValue <= 0) {
      newErrors.pointValue = 'Point value must be greater than 0';
    }
    
    if (!formData.expirationDate) {
      newErrors.expirationDate = 'Expiration date is required';
    } else if (new Date(formData.expirationDate) <= new Date()) {
      newErrors.expirationDate = 'Expiration date must be in the future';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    // Prepare data to submit
    const submitData = {
      ...formData,
      expirationDate: new Date(formData.expirationDate).toISOString()
    };
    
    if (coupon) {
      updateCoupon(coupon.id, submitData);
    } else {
      addCoupon(submitData);
    }
    
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="content" className="block text-sm font-medium text-gray-700">
          Coupon Code
        </label>
        <input
          type="text"
          id="content"
          name="content"
          value={formData.content}
          onChange={handleChange}
          className={`mt-1 input ${errors.content ? 'border-red-500' : ''}`}
        />
        {errors.content && <p className="mt-1 text-sm text-red-500">{errors.content}</p>}
      </div>
      
      <div>
        <label htmlFor="pointValue" className="block text-sm font-medium text-gray-700">
          Point Value
        </label>
        <input
          type="number"
          id="pointValue"
          name="pointValue"
          min="1"
          value={formData.pointValue}
          onChange={handleChange}
          className={`mt-1 input ${errors.pointValue ? 'border-red-500' : ''}`}
        />
        {errors.pointValue && <p className="mt-1 text-sm text-red-500">{errors.pointValue}</p>}
      </div>
      
      <div>
        <label htmlFor="expirationDate" className="block text-sm font-medium text-gray-700">
          Expiration Date
        </label>
        <input
          type="date"
          id="expirationDate"
          name="expirationDate"
          value={formData.expirationDate}
          onChange={handleChange}
          className={`mt-1 input ${errors.expirationDate ? 'border-red-500' : ''}`}
        />
        {errors.expirationDate && <p className="mt-1 text-sm text-red-500">{errors.expirationDate}</p>}
      </div>
      
      <div className="flex justify-end mt-6 space-x-3">
        <button
          type="button"
          onClick={onClose}
          className="btn btn-ghost"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn btn-primary"
        >
          {coupon ? 'Update Coupon' : 'Add Coupon'}
        </button>
      </div>
    </form>
  );
};

export default CouponForm;