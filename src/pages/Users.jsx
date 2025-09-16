import { useEffect, useState } from 'react'
import Modal from '../components/common/Modal'
import Table from '../components/common/Table'
import UserForm from '../components/user/UserForm'
import { useUsers } from '../context/UserContext'
import { Search } from 'lucide-react'

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
    const filtered = users.filter(
      (user) =>
        user.username?.toLowerCase().includes(value.toLowerCase()) ||
        user.email?.toLowerCase().includes(value.toLowerCase()) ||
        user.phoneNumber?.includes(value)
    )
    const ranked = getRankedUsers(filtered)
    setFilteredUsers(ranked)
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
      field: 'createdAt',
      header: 'Created At',
      sortable: true,
      render: (row) => {
        const date = new Date(row.createdAt?.seconds * 1000)

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
    <>
      <div className='space-y-6'>
        <div className='flex justify-between items-center'>
          <h1 className='text-2xl font-bold text-gray-900'>Users</h1>
        </div>
        <div className='flex items-center space-x-2'>
          <span className='text-gray-700 font-medium'>Total Students:</span>
          <span className='inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-800 font-semibold text-sm shadow'>
            {users.length}
          </span>
        </div>

        <div className='flex items-center justify-start relative'>
          <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
          <input
            id='search'
            type='text'
            placeholder='Search by username, email, or phone...'
            className='input ps-10 bg-white text-black w-1/2'
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>

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
    </>
  )
}

export default Users
