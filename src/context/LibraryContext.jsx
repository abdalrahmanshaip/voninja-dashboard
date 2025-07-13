import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  setDoc,
  updateDoc,
} from 'firebase/firestore'
import { createContext, useContext, useEffect, useState } from 'react'
import { db } from '../utils/firebase'

const LibraryContext = createContext()

export const useLibrary = () => useContext(LibraryContext)

export const LibraryProvider = ({ children }) => {
  const [library, setLibrary] = useState([])

  useEffect(() => {
    fetchLibrary()
  }, [])

  const fetchLibrary = async () => {
    const snapshot = await getDocs(collection(db, 'library'))

    const libraryWithUserCounts = await Promise.all(
      snapshot.docs.map(async (docSnap) => {
        const data = docSnap.data()
        const usersSnapshot = await getDocs(
          collection(db, 'library', docSnap.id, 'users')
        )

        return {
          id: docSnap.id,
          ...data,
          usersCount: usersSnapshot.size, 
        }
      })
    )

    setLibrary(libraryWithUserCounts)
  }
  const addLibraryItem = async (item) => {
    const newDocRef = doc(collection(db, 'library'))

    const itemWithId = {
      ...item,
      id: newDocRef.id,
    }

    await setDoc(newDocRef, itemWithId)
    setLibrary((prev) => [...prev, itemWithId])
  }

  const updateLibraryItem = async (id, updated) => {
    await updateDoc(doc(db, 'library', id), updated)
    setLibrary((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updated } : item))
    )
  }

  const deleteLibraryItem = async (id) => {
    await deleteDoc(doc(db, 'library', id))
    setLibrary((prev) => prev.filter((item) => item.id !== id))
  }

  const value = {
    library,
    addLibraryItem,
    updateLibraryItem,
    deleteLibraryItem,
  }

  return (
    <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>
  )
}

export default LibraryContext
