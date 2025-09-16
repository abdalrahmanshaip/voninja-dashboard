import { Plus, Users } from 'lucide-react'
import { useState } from 'react'
import { FaEdit, FaTrash } from 'react-icons/fa'
import { toast } from 'sonner'
import BoxForm from '../components/Boxes/BoxForm'
import ConfirmDialog from '../components/common/ConfirmDialog'
import Modal from '../components/common/Modal'
import Table from '../components/common/Table'
import { useBoxes } from '../context/BoxContext'
import BoxDetails from '../components/Boxes/BoxDetails'

const Boxes = () => {
  const {
    boxes,
    loading,
    error,
    addBox,
    updateBox,
    deleteBox,
    boxesOpenedByUser,
  } = useBoxes()
  const [selectedTier, setSelectedTier] = useState('bronze')
  const [selectedBox, setSelectedBox] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isBoxOpen, setBoxOpen] = useState(false)
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)

  const tierBoxes = boxes.tiers?.[selectedTier] || []

  const columns = [
    {
      field: 'index',
      header: 'Index',
      sortable: true,
      render: (row) => {
        return (
          <div>
            {row.index + 1}
          </div>
        )
      },
    },
    {
      field: 'condition.minPoints',
      header: 'Min Points',
      sortable: true,
      render: (row) => row.condition.minPoints,
    },
    {
      field: 'condition.minAds',
      header: 'Min Ads',
      sortable: true,
      render: (row) =>
        row.condition.minAds !== null ? row.condition.minAds : 'N/A',
    },
    {
      field: 'rewardPoints',
      header: 'Reward Points',
      sortable: true,
    },
  ]

  const handleDeleteClick = (box) => {
    setSelectedBox(box)
    setIsDeleteConfirmOpen(true)
  }

  const handleBoxClick = (box) => {
    setSelectedBox(box)
    setBoxOpen(true)
  }

  const handleAddSubmit = async (data) => {
    try {
      await addBox(data, selectedTier)
      toast.success('Box added successfully')
      setIsModalOpen(false)
    } catch (error) {
      toast.error('Failed to add box')
      console.error('Error adding box:', error)
    }
  }

  const handleEditSubmit = async (data) => {
    try {
      await updateBox(selectedBox.id, data, selectedTier)
      toast.success('Box updated successfully')
      setIsModalOpen(false)
    } catch (error) {
      toast.error('Failed to update box')
      console.error('Error updating box:', error)
    }
  }

  const confirmDelete = async () => {
    try {
      await deleteBox(selectedBox.id, selectedTier)
      toast.success('Box deleted successfully')
      setIsDeleteConfirmOpen(false)
    } catch (error) {
      toast.error('Failed to delete box')
      console.error('Error deleting box:', error)
    }
  }

  const renderActions = (box) => (
    <div className='flex space-x-2'>
      <button
        onClick={(e) => {
          e.stopPropagation()
          handleBoxClick(box)
        }}
        className='text-indigo-600 hover:text-indigo-900 focus:outline-none'
      >
        <Users
          size={20}
          strokeWidth={2}
        />
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation()
          setSelectedBox(box)
          setIsModalOpen(true)
        }}
        className='text-blue-600 hover:text-blue-900 focus:outline-none'
      >
        <FaEdit size={18} />
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation()
          handleDeleteClick(box)
        }}
        className='text-red-600 hover:text-red-900 focus:outline-none'
      >
        <FaTrash size={18} />
      </button>
    </div>
  )

  return (
    <>
      <div className='space-y-10'>
        <div className='flex justify-between items-center'>
          <h1 className='text-2xl font-bold text-gray-900'>Boxes Management</h1>
          <div className='flex gap-x-5'>
            <button
              onClick={() => {
                setSelectedBox(null)
                setIsModalOpen(true)
              }}
              className='btn btn-primary flex items-center  text-base'
            >
              <Plus
                size={20}
                className='mr-2'
              />
              Create Box
            </button>
          </div>
        </div>

        <div className='border-b border-gray-200'>
          <nav className='-mb-px flex space-x-8'>
            <button
              onClick={() => setSelectedTier('bronze')}
              className={`${
                selectedTier === 'bronze'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Bronze
            </button>
            <button
              onClick={() => setSelectedTier('silver')}
              className={`${
                selectedTier === 'silver'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Silver
            </button>
            <button
              onClick={() => setSelectedTier('gold')}
              className={`${
                selectedTier === 'gold'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Gold
            </button>
          </nav>
        </div>

        <div className='card'>
          {loading ? (
            <div className='flex justify-center items-center p-8'>
              <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500'></div>
            </div>
          ) : error ? (
            <div className='text-red-500 p-4'>{error}</div>
          ) : (
            <Table
              columns={columns}
              data={tierBoxes}
              actions={renderActions}
              onRowClick={handleBoxClick}
              emptyMessage="No boxes found for this tier. Click 'Add Box' to create one."
              initialSortField='index'
              initialSortDirection='asc'
              sortable={true}
            />
          )}
        </div>
      </div>

      <Modal
        size='lg'
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedBox ? 'Edit Box' : 'Add New Box'}
      >
        <BoxForm
          box={selectedBox}
          selectedTier={selectedTier}
          onClose={() => setIsModalOpen(false)}
          onSubmit={selectedBox ? handleEditSubmit : handleAddSubmit}
        />
      </Modal>

      <Modal
        size='xl'
        isOpen={isBoxOpen}
        onClose={() => setBoxOpen(false)}
        title={`Box Users`}
      >
        <BoxDetails
          box={selectedBox}
          selectedTier={selectedTier}
          boxesOpenedByUser={boxesOpenedByUser}
        />
      </Modal>

      <ConfirmDialog
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={confirmDelete}
        title='Delete Box'
        message='Are you sure you want to delete this box? This action cannot be undone.'
        confirmText='Delete'
        cancelText='Cancel'
        type='danger'
      />
    </>
  )
}

export default Boxes
