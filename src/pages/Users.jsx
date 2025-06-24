import { useEffect, useState } from 'react'
import Modal from '../components/common/Modal'
import Table from '../components/common/Table'
import UserForm from '../components/user/UserForm'
import { useUsers } from '../context/UserContext'

const Users = () => {
  const { users } = useUsers()
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [filteredUsers, setFilteredUsers] = useState([])

  const getRankedUsers = (list) => {
    const sorted = [...list].sort((a, b) => b.pointsNumber - a.pointsNumber)

    const ranked = []
    let currentRank = 1
    let previousPoints = null
    let sameRankCount = 0
    console.log(sorted)

    for (let i = 0; i < sorted.length; i++) {
      const user = sorted[i]

      if (user.pointsNumber === previousPoints) {
        sameRankCount
      } else {
        currentRank = currentRank + sameRankCount
        sameRankCount = 1
      }

      ranked.push({ ...user, rank: currentRank })
      previousPoints = user.pointsNumber
    }

    return ranked
  }

  useEffect(() => {
    const ranked = getRankedUsers(users)
    setFilteredUsers(ranked)
  }, [users])

  const handleSearch = (value) => {
    const filtered = users.filter((user) =>
      user.email.toLowerCase().includes(value.toLowerCase())
    )
    const ranked = getRankedUsers(filtered)
    setFilteredUsers(ranked)
  }

  const handleResetSearch = () => {
    const usersWithRank = getRankedUsers(users)
    setFilteredUsers(usersWithRank)
  }

  const handleEditPoints = (user) => {
    setSelectedUser(user)
    setIsEditModalOpen(true)
  }

  const columns = [
    {
      field: 'rank',
      header: 'Rank',
      sortable: false,
    },
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
      sortable: true,
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
    </div>
  )
}

export default Users
