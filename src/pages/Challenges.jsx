import { useState } from 'react';
import { useData } from '../context/DataContext';
import Table from '../components/common/Table';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import ChallengeDetails from '../components/challenges/ChallengeDetails';
import ChallengeForm from '../components/challenges/ChallengeForm';

const Challenges = () => {
  const { getChallenges, deleteChallenge } = useData();
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [challengeToDelete, setChallengeToDelete] = useState(null);

  const challenges = getChallenges();

  const handleAddChallenge = () => {
    setIsAddModalOpen(true);
  };

  const handleEditChallenge = (challenge) => {
    setSelectedChallenge(challenge);
    setIsEditModalOpen(true);
  };

  const handleViewDetails = (challenge) => {
    setSelectedChallenge(challenge);
    setIsDetailsModalOpen(true);
  };

  const handleDeleteClick = (challenge) => {
    setChallengeToDelete(challenge);
    setIsDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (challengeToDelete) {
      deleteChallenge(challengeToDelete.id);
      setChallengeToDelete(null);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const columns = [
    { field: 'id', header: 'ID', sortable: true },
    { field: 'title', header: 'Title', sortable: true },
    { 
      field: 'endTime', 
      header: 'End Time', 
      sortable: true,
      render: (row) => formatDate(row.endTime)
    },
    { 
      field: 'rewardPoints', 
      header: 'Reward Points', 
      sortable: true,
      render: (row) => `+${row.rewardPoints}`
    },
    { 
      field: 'deductionPoints', 
      header: 'Deduction Points', 
      sortable: true,
      render: (row) => `-${row.deductionPoints}`
    },
    { 
      field: 'subscriptionPoints', 
      header: 'Required Points', 
      sortable: true 
    },
    { 
      field: 'tasks', 
      header: 'Tasks Count', 
      sortable: true,
      render: (row) => row.tasks.length
    }
  ];

  const renderActions = (challenge) => (
    <>
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleViewDetails(challenge);
        }}
        className="text-indigo-600 hover:text-indigo-900 focus:outline-none"
      >
        View
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleEditChallenge(challenge);
        }}
        className="ml-2 text-green-600 hover:text-green-900 focus:outline-none"
      >
        Edit
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleDeleteClick(challenge);
        }}
        className="ml-2 text-red-600 hover:text-red-900 focus:outline-none"
      >
        Delete
      </button>
    </>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Challenges Management</h1>
        <button
          onClick={handleAddChallenge}
          className="btn btn-primary flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Challenge
        </button>
      </div>

      {/* Challenges table */}
      <div className="card">
        <Table
          columns={columns}
          data={challenges}
          actions={renderActions}
          onRowClick={handleViewDetails}
          emptyMessage="No challenges found. Click 'Add Challenge' to create one."
          initialSortField="endTime"
          initialSortDirection="asc"
        />
      </div>

      {/* Add Challenge Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Challenge"
      >
        <ChallengeForm
          onClose={() => setIsAddModalOpen(false)}
        />
      </Modal>

      {/* Edit Challenge Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Challenge"
      >
        <ChallengeForm
          challenge={selectedChallenge}
          onClose={() => setIsEditModalOpen(false)}
        />
      </Modal>

      {/* Challenge Details Modal */}
      <Modal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        title="Challenge Details"
        size="lg"
      >
        <ChallengeDetails
          challenge={selectedChallenge}
          onClose={() => setIsDetailsModalOpen(false)}
        />
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Challenge"
        message="Are you sure you want to delete this challenge? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
};

export default Challenges;