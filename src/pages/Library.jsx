import { useState } from 'react'
import { toast } from 'sonner'
import ConfirmDialog from '../components/common/ConfirmDialog'
import Modal from '../components/common/Modal'
import Table from '../components/common/Table'
import { useLibrary } from '../context/LibraryContext'
import LibraryForm from '../components/library/LibraryForm'

const Library = () => {
  const { library, deleteLibraryItem } = useLibrary()
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState(null)

  const handleAddItem = () => setIsAddModalOpen(true)
  const handleEditItem = (item) => {
    setSelectedItem(item)
    setIsEditModalOpen(true)
  }
  const handleDeleteClick = (item) => {
    setItemToDelete(item)
    setIsDeleteConfirmOpen(true)
  }

  const confirmDelete = async () => {
    if (itemToDelete) {
      try {
        await deleteLibraryItem(itemToDelete.id)
        toast.success('Library item deleted successfully')
        setItemToDelete(null)
        setIsDeleteConfirmOpen(false)
      } catch (error) {
        toast.error(error.message || 'Failed to delete library item')
      }
    }
  }

  const columns = [
    { field: 'id', header: 'ID', sortable: true },
    {
      field: 'title',
      header: 'Title',
      sortable: true,
      render: (row) => <p className='max-w-80 text-wrap'>{row.title}</p>,
    },
    {
      field: 'requiredPoint',
      header: 'Required Point',
      sortable: true,
      render: (row) => <span className='font-medium'>{row.requiredPoint}</span>,
    },
    {
      field: 'usersCount',
      header: 'User open pdf',
      sortable: true,
      render: (row) => <span>{row.usersCount ? row.usersCount : 0}</span>,
    },
    {
      field: 'createdAt',
      header: 'Created At',
      sortable: true,
      render: (row) => {
        const date = row.createdAt?.seconds
          ? new Date(row.createdAt.seconds * 1000)
          : new Date()
        return (
          <span className='font-medium'>
            {date.toLocaleString('en-US', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        )
      },
    },
    {
      field: 'url',
      header: 'Resource',
      sortable: false,
      render: (row) => (
        <a
          href={row.url}
          target='_blank'
          rel='noopener noreferrer'
          className='text-blue-600 hover:underline'
        >
          View PDF
        </a>
      ),
    },
  ]

  const renderActions = (item) => (
    <>
      <button
        onClick={(e) => {
          e.stopPropagation()
          handleEditItem(item)
        }}
        className='text-green-600 hover:text-green-900 focus:outline-none'
      >
        Edit
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation()
          handleDeleteClick(item)
        }}
        className='ml-2 text-red-600 hover:text-red-900 focus:outline-none'
      >
        Delete
      </button>
    </>
  )

  return (
    <div className='space-y-6'>
      <div className='flex justify-between items-center'>
        <h1 className='text-2xl font-bold text-gray-900'>Library</h1>
        <button
          onClick={handleAddItem}
          className='btn btn-primary flex items-center'
        >
          <svg
            className='w-5 h-5 mr-2'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth='2'
              d='M12 6v6m0 0v6m0-6h6m-6 0H6'
            />
          </svg>
          Add Library Item
        </button>
      </div>

      <div className='card'>
        <Table
          columns={columns}
          data={library}
          actions={renderActions}
          emptyMessage="No library items found. Click 'Add Library Item' to create one."
          initialSortField='createdAt'
          initialSortDirection='asc'
        />
      </div>

      {/* Add/Edit Modals (optional implementation) */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title='Add New Item'
      >
        <LibraryForm onClose={() => setIsAddModalOpen(false)} />
      </Modal>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title='Edit Item'
      >
        <LibraryForm
          item={selectedItem}
          onClose={() => setIsEditModalOpen(false)}
        />
      </Modal>

      <ConfirmDialog
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={confirmDelete}
        title='Delete Library Item'
        message='Are you sure you want to delete this item? This action cannot be undone.'
        confirmText='Delete'
        cancelText='Cancel'
        type='danger'
      />
    </div>
  )
}

export default Library
