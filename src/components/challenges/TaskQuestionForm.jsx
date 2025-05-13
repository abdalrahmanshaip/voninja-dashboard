import { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';

const TaskQuestionForm = ({ challengeId, taskId, question, onClose }) => {
  const { addTaskQuestion, updateTaskQuestion } = useData();
  const [formData, setFormData] = useState({
    content: '',
    choices: ['', '', ''],
    correctAnswer: '',
    image: ''
  });
  const [errors, setErrors] = useState({});

  // If editing, populate form with question data
  useEffect(() => {
    if (question) {
      setFormData({
        content: question.content || '',
        choices: question.choices || ['', '', ''],
        correctAnswer: question.correctAnswer || '',
        image: question.image || ''
      });
    } else {
      setFormData({
        content: '',
        choices: ['', '', ''],
        correctAnswer: '',
        image: ''
      });
    }
  }, [question]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error for this field
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };

  const handleChoiceChange = (index, value) => {
    const newChoices = [...formData.choices];
    newChoices[index] = value;
    
    setFormData({
      ...formData,
      choices: newChoices
    });
    
    // Clear error for choices
    if (errors.choices) {
      setErrors({
        ...errors,
        choices: null
      });
    }
  };

  const handleCorrectAnswerChange = (value) => {
    setFormData({
      ...formData,
      correctAnswer: value
    });
    
    // Clear error for correctAnswer
    if (errors.correctAnswer) {
      setErrors({
        ...errors,
        correctAnswer: null
      });
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.content.trim()) {
      newErrors.content = 'Question content is required';
    }
    
    // Check if all choices are filled
    const emptyChoiceIndex = formData.choices.findIndex(choice => !choice.trim());
    if (emptyChoiceIndex !== -1) {
      newErrors.choices = `Choice ${emptyChoiceIndex + 1} cannot be empty`;
    }
    
    // Check if correctAnswer is one of the choices
    if (!formData.correctAnswer.trim()) {
      newErrors.correctAnswer = 'Correct answer is required';
    } else if (!formData.choices.includes(formData.correctAnswer)) {
      newErrors.correctAnswer = 'Correct answer must be one of the choices';
    }
    
    // Check if image URL is valid
    if (formData.image && !isValidUrl(formData.image)) {
      newErrors.image = 'Image must be a valid URL';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    if (question) {
      updateTaskQuestion(challengeId, taskId, question.id, formData);
    } else {
      addTaskQuestion(challengeId, taskId, formData);
    }
    
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="content" className="block text-sm font-medium text-gray-700">
          Question
        </label>
        <textarea
          id="content"
          name="content"
          rows="2"
          value={formData.content}
          onChange={handleChange}
          className={`mt-1 input ${errors.content ? 'border-red-500' : ''}`}
        />
        {errors.content && <p className="mt-1 text-sm text-red-500">{errors.content}</p>}
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Choices
        </label>
        <div className="space-y-3">
          {formData.choices.map((choice, index) => (
            <div key={index} className="flex items-center space-x-2">
              <input
                type="radio"
                id={`correct-${index}`}
                name="correctAnswer"
                checked={formData.correctAnswer === choice}
                onChange={() => handleCorrectAnswerChange(choice)}
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
              />
              <input
                type="text"
                value={choice}
                onChange={(e) => handleChoiceChange(index, e.target.value)}
                placeholder={`Choice ${index + 1}`}
                className={`input ${errors.choices && !choice.trim() ? 'border-red-500' : ''}`}
              />
            </div>
          ))}
        </div>
        {errors.choices && <p className="mt-1 text-sm text-red-500">{errors.choices}</p>}
        {errors.correctAnswer && <p className="mt-1 text-sm text-red-500">{errors.correctAnswer}</p>}
      </div>
      
      <div>
        <label htmlFor="image" className="block text-sm font-medium text-gray-700">
          Image URL
        </label>
        <input
          type="text"
          id="image"
          name="image"
          value={formData.image}
          onChange={handleChange}
          placeholder="https://example.com/image.jpg"
          className={`mt-1 input ${errors.image ? 'border-red-500' : ''}`}
        />
        {errors.image && <p className="mt-1 text-sm text-red-500">{errors.image}</p>}
        
        {formData.image && isValidUrl(formData.image) && (
          <div className="mt-2">
            <p className="text-sm text-gray-500 mb-1">Image Preview:</p>
            <img 
              src={formData.image} 
              alt="Preview" 
              className="h-20 w-20 object-cover rounded border border-gray-300" 
            />
          </div>
        )}
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
          {question ? 'Update Question' : 'Add Question'}
        </button>
      </div>
    </form>
  );
};

export default TaskQuestionForm;