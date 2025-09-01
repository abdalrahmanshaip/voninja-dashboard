import { collection, doc, getDocs, updateDoc } from 'firebase/firestore'
import { createContext, useContext, useEffect, useState } from 'react'
import { db } from '../utils/firebase'

const UsersContext = createContext()

export const useUsers = () => useContext(UsersContext)

export const UserProvider = ({ children }) => {
  const [users, setUsers] = useState([])

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    const snapshot = await getDocs(collection(db, 'users'))
    setUsers(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })))
  }

  const changePoints = async (id, pointsNumber) => {
    await updateDoc(doc(db, 'users', id), { pointsNumber })
    setUsers(
      users.map((user) => {
        if (user.id === id) {
          return { ...user, pointsNumber }
        }
        return user
      })
    )
  }

  const value = {
    users,
    changePoints,
  }

  return <UsersContext.Provider value={value}>{children}</UsersContext.Provider>
}

export default UsersContext
