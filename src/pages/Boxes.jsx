import { Plus } from 'lucide-react'
import { useState } from 'react'
import { FaEdit, FaTrash } from 'react-icons/fa'
import { toast } from 'sonner'
import ConfirmDialog from '../components/common/ConfirmDialog'
import Modal from '../components/common/Modal'
import Table from '../components/common/Table'
import BoxForm from '../components/Boxes/BoxForm'

const Boxes = () => {
  // Mock data for boxes with three tier types
  const mockBoxesData = {
    tiers: {
      bronze: [
        {
          id: 'b1',
          condition: {
            minAds: null,
            minPoints: 400,
          },
          index: 0,
          rewardPoints: 10,
        },
        {
          id: 'b2',
          condition: {
            minAds: null,
            minPoints: 500,
          },
          index: 1,
          rewardPoints: 20,
        },
        {
          id: 'b3',
          condition: {
            minAds: null,
            minPoints: 600,
          },
          index: 2,
          rewardPoints: 30,
        },
        {
          id: 'b4',
          condition: {
            minAds: null,
            minPoints: 700,
          },
          index: 3,
          rewardPoints: 40,
        },
        {
          id: 'b5',
          condition: {
            minAds: 2,
            minPoints: 400,
          },
          index: 4,
          rewardPoints: 50,
        },
      ],
      silver: [
        {
          id: 's1',
          condition: {
            minAds: null,
            minPoints: 800,
          },
          index: 0,
          rewardPoints: 60,
        },
        {
          id: 's2',
          condition: {
            minAds: 3,
            minPoints: 600,
          },
          index: 1,
          rewardPoints: 70,
        },
      ],
      gold: [
        {
          id: 'g1',
          condition: {
            minAds: 5,
            minPoints: 1000,
          },
          index: 0,
          rewardPoints: 100,
        },
        {
          id: 'g2',
          condition: {
            minAds: 8,
            minPoints: 1200,
          },
          index: 1,
          rewardPoints: 150,
        },
      ],
    },
  }

  const [boxesData, setBoxesData] = useState(mockBoxesData)
  const [selectedTier, setSelectedTier] = useState('bronze')
  const [selectedBox, setSelectedBox] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)
  const [formData, setFormData] = useState({
    tier: 'bronze',
    minPoints: 0,
    minAds: null,
    rewardPoints: 0,
  })

  // Get boxes for the selected tier
  const boxes = boxesData.tiers[selectedTier] || []
  console.log(boxes)
  // Define table columns
  const columns = [
    {
      field: 'index',
      header: 'Index',
      sortable: true,
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


  // Open add box modal
  const handleAddBox = () => {
    setFormData({
      tier: selectedTier,
      minPoints: 0,
      minAds: null,
      rewardPoints: 0,
    })
    setSelectedBox(null)
    setIsModalOpen(true)
  }

  // Open edit box modal
  const handleEditBox = (box) => {
    setFormData({
      tier: selectedTier,
      minPoints: box.condition.minPoints,
      minAds: box.condition.minAds,
      rewardPoints: box.rewardPoints,
    })
    setSelectedBox(box)
    setIsModalOpen(true)
  }

  // Open delete confirmation
  const handleDeleteClick = (box) => {
    setSelectedBox(box)
    setIsDeleteConfirmOpen(true)
  }

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]:
        name === 'minAds' && value === ''
          ? null
          : name === 'minPoints' || name === 'rewardPoints' || name === 'minAds'
          ? Number(value)
          : value,
    })
  }

  // Handle form submission for adding a box
  const handleAddSubmit = (e) => {
    e.preventDefault()
    console.log('Adding box:', formData)

    // In a real app, you would call Firebase here
    // For now, we'll just update our mock data
    const newBox = {
      id: `${formData.tier[0]}${Date.now()}`,
      condition: {
        minAds: formData.minAds,
        minPoints: formData.minPoints,
      },
      index: boxesData.tiers[formData.tier].length,
      rewardPoints: formData.rewardPoints,
    }

    setBoxesData((prev) => ({
      ...prev,
      tiers: {
        ...prev.tiers,
        [formData.tier]: [...prev.tiers[formData.tier], newBox],
      },
    }))

    toast.success('Box added successfully')
    setIsModalOpen(false)
  }

  // Handle form submission for editing a box
  const handleEditSubmit = (e) => {
    e.preventDefault()
    console.log('Editing box:', formData)

    // In a real app, you would call Firebase here
    // For now, we'll just update our mock data
    const updatedBoxes = boxesData.tiers[selectedTier].map((box) => {
      if (box.id === selectedBox.id) {
        return {
          ...box,
          condition: {
            minAds: formData.minAds,
            minPoints: formData.minPoints,
          },
          rewardPoints: formData.rewardPoints,
        }
      }
      return box
    })

    setBoxesData((prev) => ({
      ...prev,
      tiers: {
        ...prev.tiers,
        [selectedTier]: updatedBoxes,
      },
    }))

    toast.success('Box updated successfully')
    setIsEditModalOpen(false)
  }

  // Handle box deletion
  const confirmDelete = () => {
    console.log('Deleting box:', selectedBox)

    // In a real app, you would call Firebase here
    // For now, we'll just update our mock data
    const filteredBoxes = boxesData.tiers[selectedTier].filter(
      (box) => box.id !== selectedBox.id
    )

    setBoxesData((prev) => ({
      ...prev,
      tiers: {
        ...prev.tiers,
        [selectedTier]: filteredBoxes,
      },
    }))

    toast.success('Box deleted successfully')
    setIsDeleteConfirmOpen(false)
  }

  // Render actions column
  const renderActions = (box) => (
    <div className='flex space-x-2'>
      <button
        onClick={(e) => {
          e.stopPropagation()
          handleEditBox(box)
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
              onClick={handleAddBox}
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
          <Table
            columns={columns}
            data={boxes}
            actions={renderActions}
            emptyMessage="No boxes found for this tier. Click 'Add Box' to create one."
            initialSortField='index'
            initialSortDirection='asc'
          />
        </div>
      </div>
      {/* Add , Edit Box Modal */}
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
        />
      </Modal>

      {/* Delete Confirmation Dialog */}
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
