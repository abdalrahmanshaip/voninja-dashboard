import { useState } from 'react';
import { useData } from '../context/DataContext';
import Table from '../components/common/Table';
import ConfirmDialog from '../components/common/ConfirmDialog';

const Transactions = () => {
  const { getTransactions, updateTransactionStatus } = useData();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [actionType, setActionType] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const transactions = getTransactions();
  
  const filteredTransactions = statusFilter === 'all' 
    ? transactions 
    : transactions.filter(t => t.status === statusFilter);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const handleAction = (transaction, action) => {
    setSelectedTransaction(transaction);
    setActionType(action);
    setIsConfirmOpen(true);
  };

  const confirmAction = () => {
    if (selectedTransaction) {
      updateTransactionStatus(selectedTransaction.id, actionType);
      setSelectedTransaction(null);
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const columns = [
    { field: 'id', header: 'ID', sortable: true },
    { field: 'username', header: 'Username', sortable: true },
    { field: 'phone', header: 'Phone', sortable: true },
    { 
      field: 'points', 
      header: 'Points', 
      sortable: true,
      render: (row) => (
        <span className="font-medium">{row.points}</span>
      )
    },
    { 
      field: 'price', 
      header: 'Price', 
      sortable: true,
      render: (row) => (
        <span className="font-medium">${row.price.toFixed(2)}</span>
      )
    },
    { 
      field: 'status', 
      header: 'Status', 
      sortable: true,
      render: (row) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(row.status)}`}>
          {row.status}
        </span>
      )
    },
    { 
      field: 'date', 
      header: 'Date', 
      sortable: true,
      render: (row) => formatDate(row.date)
    }
  ];

  const renderActions = (transaction) => {
    if (transaction.status === 'pending') {
      return (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleAction(transaction, 'approved');
            }}
            className="text-green-600 hover:text-green-900 focus:outline-none"
          >
            Approve
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleAction(transaction, 'rejected');
            }}
            className="ml-2 text-red-600 hover:text-red-900 focus:outline-none"
          >
            Reject
          </button>
        </>
      );
    }
    return (
      <span className="text-gray-500">No actions</span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
        <div className="flex items-center space-x-2">
          <label htmlFor="status-filter" className="text-sm font-medium text-gray-700">
            Status:
          </label>
          <select
            id="status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="select"
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Transactions table */}
      <div className="card">
        <Table
          columns={columns}
          data={filteredTransactions}
          actions={renderActions}
          emptyMessage={`No ${statusFilter !== 'all' ? statusFilter : ''} transactions found.`}
          initialSortField="date"
          initialSortDirection="desc"
        />
      </div>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={confirmAction}
        title={actionType === 'approved' ? 'Approve Transaction' : 'Reject Transaction'}
        message={`Are you sure you want to ${actionType === 'approved' ? 'approve' : 'reject'} this transaction?`}
        confirmText={actionType === 'approved' ? 'Approve' : 'Reject'}
        cancelText="Cancel"
        type={actionType === 'approved' ? 'info' : 'danger'}
      />
    </div>
  );
};

export default Transactions;