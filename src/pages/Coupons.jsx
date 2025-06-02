import { useState } from 'react'
import { useCoupon } from '../context/CouponContext'
import Table from '../components/common/Table'
import Modal from '../components/common/Modal'
import ConfirmDialog from '../components/common/ConfirmDialog'
import CouponForm from '../components/coupons/CouponForm'

const Coupons = () => {
  const { coupons, deleteCoupon } = useCoupon()
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedCoupon, setSelectedCoupon] = useState(null)
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)
  const [couponToDelete, setCouponToDelete] = useState(null)

  const handleAddCoupon = () => {
    setIsAddModalOpen(true)
  }

  const handleEditCoupon = (coupon) => {
    setSelectedCoupon(coupon)
    setIsEditModalOpen(true)
  }

  const handleDeleteClick = (coupon) => {
    setCouponToDelete(coupon)
    setIsDeleteConfirmOpen(true)
  }

  const confirmDelete = () => {
    if (couponToDelete) {
      deleteCoupon(couponToDelete.id)
      setCouponToDelete(null)
    }
  }

  const getExpirationStatus = (expirationDate) => {
    const now = new Date()
    const expiry = new Date(expirationDate)
    return now > expiry
  }

  const columns = [
    { field: 'id', header: 'ID', sortable: true },
    { field: 'id', header: 'Coupon Code', sortable: true },
    {
      field: 'points',
      header: 'Point Value',
      sortable: true,
      render: (row) => <span className='font-medium'>{row.points}</span>,
    },
    {
      field: 'expirationDate',
      header: 'Expiration Date',
      sortable: true,
      render: (row) => {
        const date = new Date(row.expireDate.seconds * 1000)
        return <span className='font-medium'>{date.toLocaleDateString()}</span>
      },
    },
    {
      field: 'status',
      header: 'Status',
      sortable: false,
      render: (row) => {
        const isExpired = getExpirationStatus(row.expirationDate)
        return (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              isExpired
                ? 'bg-red-100 text-red-800'
                : 'bg-green-100 text-green-800'
            }`}
          >
            {isExpired ? 'Expired' : 'Active'}
          </span>
        )
      },
    },
  ]

  const renderActions = (coupon) => (
    <>
      <button
        onClick={(e) => {
          e.stopPropagation()
          handleEditCoupon(coupon)
        }}
        className='text-green-600 hover:text-green-900 focus:outline-none'
      >
        Edit
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation()
          handleDeleteClick(coupon)
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
        <h1 className='text-2xl font-bold text-gray-900'>Coupons</h1>
        <button
          onClick={handleAddCoupon}
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
          Add Coupon
        </button>
      </div>

      {/* Coupons table */}
      <div className='card'>
        <Table
          columns={columns}
          data={coupons}
          actions={renderActions}
          emptyMessage="No coupons found. Click 'Add Coupon' to create one."
          initialSortField='expirationDate'
          initialSortDirection='asc'
        />
      </div>

      {/* Add Coupon Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title='Add New Coupon'
      >
        <CouponForm onClose={() => setIsAddModalOpen(false)} />
      </Modal>

      {/* Edit Coupon Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title='Edit Coupon'
      >
        <CouponForm
          coupon={selectedCoupon}
          onClose={() => setIsEditModalOpen(false)}
        />
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={confirmDelete}
        title='Delete Coupon'
        message='Are you sure you want to delete this coupon? This action cannot be undone.'
        confirmText='Delete'
        cancelText='Cancel'
        type='danger'
      />
    </div>
  )
}

export default Coupons
