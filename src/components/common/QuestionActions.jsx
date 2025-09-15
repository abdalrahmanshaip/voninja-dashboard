/* eslint-disable react/prop-types */
import { ClipboardList, Copy, Plus } from 'lucide-react'
import { toast } from 'sonner'

const QuestionActions = ({ selectedRows, handlePaste, openAddModal }) => {


  const handleCopyQuestions = (selectedQuestions) => {
    const dataString = JSON.stringify(selectedQuestions)
    navigator.clipboard
      .writeText(dataString)
      .then(() =>
        toast.success(
          `${selectedQuestions.length} question(s) copied to clipboard!`
        )
      )
      .catch((err) => toast.error('Failed to copy: ' + err.message))
  }

  return (
    <div className='flex gap-2'>
      <button
        className={`btn flex items-center text-base ${
          selectedRows.length === 0 ? ' btn-disabled' : 'btn-secondary'
        }`}
        disabled={selectedRows.length === 0}
        onClick={() => handleCopyQuestions(selectedRows)}
      >
        <Copy
          size={20}
          className='mr-2'
        />
        Copy Selected
      </button>
      <button
        className='btn btn-primary flex items-center text-base'
        onClick={() => openAddModal(true)}
      >
        <Plus
          size={20}
          className='mr-2'
        />
        Add Question
      </button>
      <button
        onClick={handlePaste}
        className='btn btn-info flex items-center text-base'
      >
        <ClipboardList
          size={20}
          className='mr-2'
        />
        Paste Questions
      </button>
    </div>
  )
}

export default QuestionActions
