import { useState } from 'react'
import ConfirmDialog from '../components/common/ConfirmDialog'
import Table from '../components/common/Table'
import { useTransaction } from '../context/TransationContext'
import { toast } from 'sonner'

const Transactions = () => {
  const { transactions, updateTransaction, usersMap } = useTransaction()
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState(null)
  const [actionType, setActionType] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const filteredTransactions =
    statusFilter === 'all'
      ? transactions
      : transactions.filter((t) => t.status === statusFilter)

  const formatDate = (timestamp) => {
    if (timestamp && timestamp.seconds) {
      const date = new Date(
        timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000
      )
      return date.toLocaleString()
    }
    return 'Invalid date'
  }
  const handleAction = (transaction, action) => {
    setSelectedTransaction(transaction)
    setActionType(action)
    setIsConfirmOpen(true)
  }

  const confirmAction = async () => {
    if (selectedTransaction) {
      try {
        await updateTransaction(selectedTransaction.id, {
          status: actionType
        })
        toast.success(`Transaction successfully ${actionType.toLowerCase()}`)
        setSelectedTransaction(null)
      } catch (error) {
        console.error('Error updating transaction:', error)
        toast.error(`Failed to ${actionType.toLowerCase()} transaction: ${error.message}`)
      }
    }
  }

  const getStatusClass = (status) => {
    switch (status) {
      case 'Approved':
        return 'bg-green-100 text-green-800'
      case 'Rejected':
        return 'bg-red-100 text-red-800'
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const columns = [
    { field: 'id', header: 'ID', sortable: true },
    {
      field: 'userId',
      header: 'Username',
      sortable: true,
      render: (row) => <span>{usersMap[row.userId] || row.userId}</span>,
    },
    { field: 'contactPhoneNumber', header: 'Phone', sortable: true },
    {
      field: 'points',
      header: 'Points',
      sortable: true,
      render: (row) => <span className='font-medium'>{row.points}</span>,
    },
    {
      field: 'price',
      header: 'Price',
      sortable: true,
      render: (row) => (
        <span className='font-medium'>${row.price.toFixed(2)}</span>
      ),
    },
    {
      field: 'status',
      header: 'Status',
      sortable: true,
      render: (row) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(
            row.status
          )}`}
        >
          {row.status}
        </span>
      ),
    },
    {
      field: 'date',
      header: 'Date',
      sortable: true,
      render: (row) => formatDate(row.createdAt),
    },
  ]

  const renderActions = (transaction) => {
    if (transaction.status === 'pending' || transaction.status === 'Pending') {
      return (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleAction(transaction, 'Approved')
            }}
            className='text-green-600 hover:text-green-900 focus:outline-none'
          >
            Approve
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleAction(transaction, 'Rejected')
            }}
            className='ml-2 text-red-600 hover:text-red-900 focus:outline-none'
          >
            Reject
          </button>
        </>
      )
    }
    return <span className='text-gray-500'>No actions</span>
  }

  return (
    <div className='space-y-6'>
      <div className='flex justify-between items-center'>
        <h1 className='text-2xl font-bold text-gray-900'>Transactions</h1>
        <div className='flex items-center space-x-2'>
          <label
            htmlFor='status-filter'
            className='text-sm font-medium text-gray-700'
          >
            Status:
          </label>
          <select
            id='status-filter'
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className='select'
          >
            <option value='all'>All</option>
            <option value='Pending'>Pending</option>
            <option value='Approved'>Approved</option>
            <option value='Rejected'>Rejected</option>
          </select>
        </div>
      </div>

      {/* Transactions table */}
      <div className='card'>
        <Table
          columns={columns}
          data={filteredTransactions}
          actions={renderActions}
          emptyMessage={`No ${
            statusFilter !== 'all' ? statusFilter : ''
          } transactions found.`}
          initialSortField='date'
          initialSortDirection='desc'
        />
      </div>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={confirmAction}
        title={
          actionType === 'approved'
            ? 'Approve Transaction'
            : 'Reject Transaction'
        }
        message={`Are you sure you want to ${
          actionType === 'Approved' ? 'approve' : 'reject'
        } this transaction?`}
        confirmText={actionType === 'Approved' ? 'Approve' : 'Reject'}
        cancelText='Cancel'
        type={actionType === 'Approved' ? 'info' : 'danger'}
      />
    </div>
  )
}

export default Transactions
