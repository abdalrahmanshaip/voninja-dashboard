import {
  collection,
  doc,
  getDocs,
  updateDoc
} from 'firebase/firestore'
import PropTypes from 'prop-types'
import { createContext, useContext, useEffect, useState } from 'react'
import { db } from '../utils/firebase'

const TransactionsContext = createContext()

export const useTransaction = () => useContext(TransactionsContext)

export const TransactionsProvider = ({ children }) => {
  const [transactions, setTransactions] = useState([])
  const [usersMap, setUsersMap] = useState({})

  useEffect(() => {
    fetchTransactions()
    fetchUsers()
  }, [])

  const fetchTransactions = async () => {
    const snapshot = await getDocs(collection(db, 'transaction'))
    setTransactions(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })))
  }

  const fetchUsers = async () => {
    const snapshot = await getDocs(collection(db, 'users'))
    const users = {}
    snapshot.forEach((doc) => {
      users[doc.id] = doc.data().username
    })
    setUsersMap(users)
  }

  const updateTransaction = async (id, updated) => {
    await updateDoc(doc(db, 'transaction', id), updated)
    fetchTransactions()
  }

  const value = {
    transactions,
    updateTransaction,
    usersMap,
  }

  return (
    <TransactionsContext.Provider value={value}>
      {children}
    </TransactionsContext.Provider>
  )
}

export default TransactionsContext

TransactionsProvider.propTypes = {
  children: PropTypes.node.isRequired,
}