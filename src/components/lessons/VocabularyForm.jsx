import { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { toast } from 'sonner'

const VocabularyForm = ({ lessonId, vocabulary, onClose, levelId }) => {
  console.log(vocabulary)
  const { addVocabulary, updateVocabulary } = useData();
  const [formData, setFormData] = useState({
    word: '',
    translated_word: '',
    statement_example: '',
    translated_statement_example: '',
    image_url: ''
  });
  const [errors, setErrors] = useState({});

  // If editing, populate form with vocabulary data
  useEffect(() => {
    if (vocabulary) {
      setFormData({
        word: vocabulary.word || '',
        translated_word: vocabulary.translated_word || '',
        statement_example: vocabulary.statement_example || '',
        translated_statement_example: vocabulary.translated_statement_example || '',
        image_url: vocabulary.image_url || ''
      });
    } else {
      setFormData({
        word: '',
        translated_word: '',
        statement_example: '',
        translated_statement_example: '',
        image_url: ''
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
    
    if (!formData.translated_word.trim()) {
      newErrors.translated_word = 'Translated word is required';
    }
    
    if (!formData.statement_example.trim()) {
      newErrors.statement_example = 'English statement is required';
    }
    
    if (!formData.translated_statement_example.trim()) {
      newErrors.translated_statement_example = 'Arabic statement is required';
    }
    
    if (formData.image_url && !isValidUrl(formData.image)) {
      newErrors.image_url = 'Image must be a valid URL';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch  {
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    try {
      if (vocabulary) {
        await updateVocabulary(levelId, lessonId, vocabulary.id, formData);
        toast.success('Vocabulary updated successfully');
      } else {
        await addVocabulary(levelId, lessonId, formData);
        toast.success('Vocabulary added successfully');
      }
      onClose();
    } catch (error) {
      console.error('Error submitting vocabulary:', error);
      toast.error(error.message || 'Failed to save vocabulary');
    }
  };
console.log(errors)
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
            defaultValue={formData.word}
            onChange={handleChange}
            className={`mt-1 input ${errors.word ? 'border-red-500' : ''}`}
          />
          {errors.word && <p className="mt-1 text-sm text-red-500">{errors.word}</p>}
        </div>
        
        <div>
          <label htmlFor="translated_word" className="block text-sm font-medium text-gray-700">
            Translated Word
          </label>
          <input
            type="text"
            id="translated_word"
            name="translated_word"
            defaultValue={formData.translated_word}
            onChange={handleChange}
            className={`mt-1 input ${errors.translated_word ? 'border-red-500' : ''}`}
          />
          {errors.translated_word && <p className="mt-1 text-sm text-red-500">{errors.translated_word}</p>}
        </div>
      </div>
      
      <div>
        <label htmlFor="statement_example" className="block text-sm font-medium text-gray-700">
          English Statement
        </label>
        <input
          type="text"
          id="statement_example"
          name="statement_example"
          defaultValue={formData.statement_example}
          onChange={handleChange}
          className={`mt-1 input ${errors.statement_example ? 'border-red-500' : ''}`}
        />
        {errors.statement_example && <p className="mt-1 text-sm text-red-500">{errors.statement_example}</p>}
      </div>
      
      <div>
        <label htmlFor="translated_statement_example" className="block text-sm font-medium text-gray-700">
          Arabic Statement
        </label>
        <input
          type="text"
          id="translated_statement_example"
          name="translated_statement_example"
          defaultValue={formData.translated_statement_example}
          onChange={handleChange}
          className={`mt-1 input ${errors.translated_statement_example ? 'border-red-500' : ''}`}
        />
        {errors.translated_statement_example && <p className="mt-1 text-sm text-red-500">{errors.translated_statement_example}</p>}
      </div>
      
      <div>
        <label htmlFor="image" className="block text-sm font-medium text-gray-700">
          Image URL
        </label>
        <input
          type="text"
          id="image"
          name="image"
          defaultValue={formData.image_url}
          onChange={handleChange}
          placeholder="https://example.com/image.jpg"
          className={`mt-1 input ${errors.image_url ? 'border-red-500' : ''}`}
        />
        {errors.image_url && <p className="mt-1 text-sm text-red-500">{errors.image_url}</p>}
        
        {formData.image_url && isValidUrl(formData.image_url) && (
          <div className="mt-2">
            <p className="text-sm text-gray-500 mb-1">Image Preview:</p>
            <img 
              src={formData.image_url} 
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