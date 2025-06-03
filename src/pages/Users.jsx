import { useState } from 'react'
import Modal from '../components/common/Modal'
import Table from '../components/common/Table'
import CouponForm from '../components/coupons/CouponForm'
import UserForm from '../components/user/UserForm'
import { useUsers } from '../context/UserContext'

const Users = () => {
  const { users } = useUsers()
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)
  const [couponToDelete, setCouponToDelete] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredUsers, setFilteredUsers] = useState(users)

  const handleSearch = (value) => {
    setSearchTerm(value)
    const filtered = users.filter((user) =>
      user.email.toLowerCase().includes(value.toLowerCase())
    )
    setFilteredUsers(filtered)
  }

  const handleResetSearch = () => {
    setSearchTerm('')
    setFilteredUsers(users)
  }

  const handleEditPoints = (user) => {
    setSelectedUser(user)
    setIsEditModalOpen(true)
  }

  // const handleDeleteClick = (coupon) => {
  //   setCouponToDelete(coupon)
  //   setIsDeleteConfirmOpen(true)
  // }

  // const confirmDelete = () => {
  //   if (couponToDelete) {
  //     deleteCoupon(couponToDelete.id)
  //     setCouponToDelete(null)
  //   }
  // }

  const columns = [
    { field: 'userId', header: 'ID', sortable: true },
    { field: 'email', header: 'Email', sortable: true },
    {
      field: 'username',
      header: 'Username',
      sortable: true,
    },
    {
      field: 'phoneNumber',
      header: 'Phone Number',
      sortable: true,
      render: (row) => <span className='font-medium'>{row.phoneNumber}</span>,
    },
    {
      field: 'pointsNumber',
      header: 'Points Number',
      sortable: false,
    },
  ]

  const renderActions = (user) => (
    <>
      <button
        onClick={(e) => {
          e.stopPropagation()
          handleEditPoints(user)
        }}
        className='text-green-600 hover:text-green-900 focus:outline-none'
      >
        Edit
      </button>
      {/* <button
        onClick={(e) => {
          e.stopPropagation()
          handleDeleteClick(user)
        }}
        className='ml-2 text-red-600 hover:text-red-900 focus:outline-none'
      >
        Block
      </button> */}
    </>
  )

  return (
    <div className='space-y-6'>
      <div className='flex justify-between items-center'>
        <h1 className='text-2xl font-bold text-gray-900'>Users</h1>
      </div>
      <form className='flex items-center justify-start w-fit'>
        <input
          id='search'
          type='search'
          autoComplete='email'
          placeholder='Search User by email...'
          className='input bg-white text-black w-60'
          onChange={(e) => handleSearch(e.target.value)}
        />
        <button
          type='reset'
          onClick={handleResetSearch}
          className='bg-black hover:bg-black/90 focus:ring-white text-white w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-1.5 text-base font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm '
        >
          Reset
        </button>
      </form>
      {/* Coupons table */}
      <div className='card'>
        <Table
          columns={columns}
          data={filteredUsers}
          actions={renderActions}
          emptyMessage="No coupons found. Click 'Add Coupon' to create one."
          initialSortField='expirationDate'
          initialSortDirection='asc'
        />
      </div>
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title='Edit Points of user'
      >
        <UserForm
          user={selectedUser}
          onClose={() => setIsEditModalOpen(false)}
        />
      </Modal>

      {/* Delete Confirmation Dialog */}
      {/* <ConfirmDialog
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={confirmDelete}
        title='Delete Coupon'
        message='Are you sure you want to delete this coupon? This action cannot be undone.'
        confirmText='Delete'
        cancelText='Cancel'
        type='danger'
      /> */}
    </div>
  )
}

export default Users
