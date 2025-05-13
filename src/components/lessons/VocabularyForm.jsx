import { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';

const VocabularyForm = ({ lessonId, vocabulary, onClose }) => {
  const { addVocabulary, updateVocabulary } = useData();
  const [formData, setFormData] = useState({
    word: '',
    translatedWord: '',
    englishStatement: '',
    arabicStatement: '',
    image: ''
  });
  const [errors, setErrors] = useState({});

  // If editing, populate form with vocabulary data
  useEffect(() => {
    if (vocabulary) {
      setFormData({
        word: vocabulary.word || '',
        translatedWord: vocabulary.translatedWord || '',
        englishStatement: vocabulary.englishStatement || '',
        arabicStatement: vocabulary.arabicStatement || '',
        image: vocabulary.image || ''
      });
    } else {
      setFormData({
        word: '',
        translatedWord: '',
        englishStatement: '',
        arabicStatement: '',
        image: ''
      });
    }
  }, [vocabulary]);

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

  const validate = () => {
    const newErrors = {};
    
    if (!formData.word.trim()) {
      newErrors.word = 'Word is required';
    }
    
    if (!formData.translatedWord.trim()) {
      newErrors.translatedWord = 'Translated word is required';
    }
    
    if (!formData.englishStatement.trim()) {
      newErrors.englishStatement = 'English statement is required';
    }
    
    if (!formData.arabicStatement.trim()) {
      newErrors.arabicStatement = 'Arabic statement is required';
    }
    
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
    
    if (vocabulary) {
      updateVocabulary(lessonId, vocabulary.id, formData);
    } else {
      addVocabulary(lessonId, formData);
    }
    
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="word" className="block text-sm font-medium text-gray-700">
            Word
          </label>
          <input
            type="text"
            id="word"
            name="word"
            value={formData.word}
            onChange={handleChange}
            className={`mt-1 input ${errors.word ? 'border-red-500' : ''}`}
          />
          {errors.word && <p className="mt-1 text-sm text-red-500">{errors.word}</p>}
        </div>
        
        <div>
          <label htmlFor="translatedWord" className="block text-sm font-medium text-gray-700">
            Translated Word
          </label>
          <input
            type="text"
            id="translatedWord"
            name="translatedWord"
            value={formData.translatedWord}
            onChange={handleChange}
            className={`mt-1 input ${errors.translatedWord ? 'border-red-500' : ''}`}
          />
          {errors.translatedWord && <p className="mt-1 text-sm text-red-500">{errors.translatedWord}</p>}
        </div>
      </div>
      
      <div>
        <label htmlFor="englishStatement" className="block text-sm font-medium text-gray-700">
          English Statement
        </label>
        <input
          type="text"
          id="englishStatement"
          name="englishStatement"
          value={formData.englishStatement}
          onChange={handleChange}
          className={`mt-1 input ${errors.englishStatement ? 'border-red-500' : ''}`}
        />
        {errors.englishStatement && <p className="mt-1 text-sm text-red-500">{errors.englishStatement}</p>}
      </div>
      
      <div>
        <label htmlFor="arabicStatement" className="block text-sm font-medium text-gray-700">
          Arabic Statement
        </label>
        <input
          type="text"
          id="arabicStatement"
          name="arabicStatement"
          value={formData.arabicStatement}
          onChange={handleChange}
          className={`mt-1 input ${errors.arabicStatement ? 'border-red-500' : ''}`}
        />
        {errors.arabicStatement && <p className="mt-1 text-sm text-red-500">{errors.arabicStatement}</p>}
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
          {vocabulary ? 'Update Vocabulary' : 'Add Vocabulary'}
        </button>
      </div>
    </form>
  );
};

export default VocabularyForm;