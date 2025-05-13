import { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';

const ChallengeForm = ({ challenge, onClose }) => {
  const { addChallenge, updateChallenge } = useData();
  const [formData, setFormData] = useState({
    title: '',
    endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    deductionPoints: 5,
    rewardPoints: 20,
    subscriptionPoints: 100,
    rewards: {
      first: 500,
      second: 300,
      third: 150
    }
  });
  const [errors, setErrors] = useState({});

  // If editing, populate form with challenge data
  useEffect(() => {
    if (challenge) {
      setFormData({
        title: challenge.title || '',
        endTime: new Date(challenge.endTime).toISOString().slice(0, 16),
        deductionPoints: challenge.deductionPoints || 5,
        rewardPoints: challenge.rewardPoints || 20,
        subscriptionPoints: challenge.subscriptionPoints || 100,
        rewards: {
          first: challenge.rewards?.first || 500,
          second: challenge.rewards?.second || 300,
          third: challenge.rewards?.third || 150
        }
      });
    } else {
      setFormData({
        title: '',
        endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
        deductionPoints: 5,
        rewardPoints: 20,
        subscriptionPoints: 100,
        rewards: {
          first: 500,
          second: 300,
          third: 150
        }
      });
    }
  }, [challenge]);

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

  const handleRewardChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      rewards: {
        ...formData.rewards,
        [name]: parseInt(value, 10)
      }
    });
    
    // Clear error for this field
    if (errors[`rewards.${name}`]) {
      setErrors({
        ...errors,
        [`rewards.${name}`]: null
      });
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.endTime) {
      newErrors.endTime = 'End time is required';
    } else if (new Date(formData.endTime) <= new Date()) {
      newErrors.endTime = 'End time must be in the future';
    }
    
    if (formData.deductionPoints < 0) {
      newErrors.deductionPoints = 'Deduction points must be a positive number';
    }
    
    if (formData.rewardPoints < 0) {
      newErrors.rewardPoints = 'Reward points must be a positive number';
    }
    
    if (formData.subscriptionPoints < 0) {
      newErrors.subscriptionPoints = 'Subscription points must be a positive number';
    }
    
    if (formData.rewards.first < 0) {
      newErrors['rewards.first'] = '1st place reward must be a positive number';
    }
    
    if (formData.rewards.second < 0) {
      newErrors['rewards.second'] = '2nd place reward must be a positive number';
    }
    
    if (formData.rewards.third < 0) {
      newErrors['rewards.third'] = '3rd place reward must be a positive number';
    }
    
    // Validate that rewards are in decreasing order
    if (formData.rewards.second > formData.rewards.first) {
      newErrors['rewards.second'] = '2nd place reward must be less than 1st place';
    }
    
    if (formData.rewards.third > formData.rewards.second) {
      newErrors['rewards.third'] = '3rd place reward must be less than 2nd place';
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
      endTime: new Date(formData.endTime).toISOString()
    };
    
    if (challenge) {
      updateChallenge(challenge.id, submitData);
    } else {
      addChallenge(submitData);
    }
    
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Challenge Title
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
        <label htmlFor="endTime" className="block text-sm font-medium text-gray-700">
          End Time
        </label>
        <input
          type="datetime-local"
          id="endTime"
          name="endTime"
          value={formData.endTime}
          onChange={handleChange}
          className={`mt-1 input ${errors.endTime ? 'border-red-500' : ''}`}
        />
        {errors.endTime && <p className="mt-1 text-sm text-red-500">{errors.endTime}</p>}
      </div>
      
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="rewardPoints" className="block text-sm font-medium text-gray-700">
            Reward Points (+)
          </label>
          <input
            type="number"
            id="rewardPoints"
            name="rewardPoints"
            min="0"
            value={formData.rewardPoints}
            onChange={handleChange}
            className={`mt-1 input ${errors.rewardPoints ? 'border-red-500' : ''}`}
          />
          {errors.rewardPoints && <p className="mt-1 text-sm text-red-500">{errors.rewardPoints}</p>}
        </div>
        
        <div>
          <label htmlFor="deductionPoints" className="block text-sm font-medium text-gray-700">
            Deduction Points (-)
          </label>
          <input
            type="number"
            id="deductionPoints"
            name="deductionPoints"
            min="0"
            value={formData.deductionPoints}
            onChange={handleChange}
            className={`mt-1 input ${errors.deductionPoints ? 'border-red-500' : ''}`}
          />
          {errors.deductionPoints && <p className="mt-1 text-sm text-red-500">{errors.deductionPoints}</p>}
        </div>
        
        <div>
          <label htmlFor="subscriptionPoints" className="block text-sm font-medium text-gray-700">
            Required Points to Join
          </label>
          <input
            type="number"
            id="subscriptionPoints"
            name="subscriptionPoints"
            min="0"
            value={formData.subscriptionPoints}
            onChange={handleChange}
            className={`mt-1 input ${errors.subscriptionPoints ? 'border-red-500' : ''}`}
          />
          {errors.subscriptionPoints && <p className="mt-1 text-sm text-red-500">{errors.subscriptionPoints}</p>}
        </div>
      </div>
      
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-2">Top 3 Rank Rewards</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="first" className="block text-sm text-gray-500">
              1st Place
            </label>
            <input
              type="number"
              id="first"
              name="first"
              min="0"
              value={formData.rewards.first}
              onChange={handleRewardChange}
              className={`mt-1 input ${errors['rewards.first'] ? 'border-red-500' : ''}`}
            />
            {errors['rewards.first'] && <p className="mt-1 text-sm text-red-500">{errors['rewards.first']}</p>}
          </div>
          
          <div>
            <label htmlFor="second" className="block text-sm text-gray-500">
              2nd Place
            </label>
            <input
              type="number"
              id="second"
              name="second"
              min="0"
              value={formData.rewards.second}
              onChange={handleRewardChange}
              className={`mt-1 input ${errors['rewards.second'] ? 'border-red-500' : ''}`}
            />
            {errors['rewards.second'] && <p className="mt-1 text-sm text-red-500">{errors['rewards.second']}</p>}
          </div>
          
          <div>
            <label htmlFor="third" className="block text-sm text-gray-500">
              3rd Place
            </label>
            <input
              type="number"
              id="third"
              name="third"
              min="0"
              value={formData.rewards.third}
              onChange={handleRewardChange}
              className={`mt-1 input ${errors['rewards.third'] ? 'border-red-500' : ''}`}
            />
            {errors['rewards.third'] && <p className="mt-1 text-sm text-red-500">{errors['rewards.third']}</p>}
          </div>
        </div>
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
          {challenge ? 'Update Challenge' : 'Add Challenge'}
        </button>
      </div>
    </form>
  );
};

export default ChallengeForm;