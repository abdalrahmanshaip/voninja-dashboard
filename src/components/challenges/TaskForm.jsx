import { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';

const TaskForm = ({ challengeId, task, onClose }) => {
  const { addTask, updateTask } = useData();
  const [formData, setFormData] = useState({
    title: '',
    order: 1
  });
  const [errors, setErrors] = useState({});

  // If editing, populate form with task data
  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        order: task.order || 1
      });
    } else {
      setFormData({
        title: '',
        order: 1
      });
    }
  }, [task]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    
    setFormData({
      ...formData,
      [name]: type === 'number' ? parseInt(value, 10) : value
    });
    
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
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.order || formData.order < 1) {
      newErrors.order = 'Order must be a positive number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    if (task) {
      updateTask(challengeId, task.id, formData);
    } else {
      addTask(challengeId, formData);
    }
    
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Task Title
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className={`mt-1 input ${errors.title ? 'border-red-500' : ''}`}
        />
        {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title}</p>}
      </div>
      
      <div>
        <label htmlFor="order" className="block text-sm font-medium text-gray-700">
          Order
        </label>
        <input
          type="number"
          id="order"
          name="order"
          min="1"
          value={formData.order}
          onChange={handleChange}
          className={`mt-1 input ${errors.order ? 'border-red-500' : ''}`}
        />
        {errors.order && <p className="mt-1 text-sm text-red-500">{errors.order}</p>}
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
          {task ? 'Update Task' : 'Add Task'}
        </button>
      </div>
    </form>
  );
};

export default TaskForm;