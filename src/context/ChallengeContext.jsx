import { createContext, useContext, useEffect, useState } from 'react'
import { db } from '../utils/firebase'
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  setDoc,
} from 'firebase/firestore'

const ChallengeContext = createContext()

export const useChallenge = () => {
  const context = useContext(ChallengeContext)
  if (!context) {
    throw new Error('useChallenge must be used within a ChallengeProvider')
  }
  return context
}

export const ChallengeProvider = ({ children }) => {
  const [challenges, setChallenges] = useState([])

  useEffect(() => {
    fetchChallenges()
  }, [])

  const fetchChallenges = async () => {
    const snapshot = await getDocs(collection(db, 'challenges'))
    setChallenges(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })))
  }
  // === Challenges ===

  const addChallenge = async (challenge) => {
    const newDocRef = doc(collection(db, 'challenges'))
    const challengeWithId = {
      ...challenge,
      challengeId: newDocRef.id,
    }
    await setDoc(newDocRef, challengeWithId)
    await fetchChallenges()
  }

  const updateChallenge = async (challengeId, updated) => {
    const ref = doc(db, 'challenges', challengeId)
    await updateDoc(ref, updated)
    await fetchChallenges()
  }

  const deleteChallenge = async (challengeId) => {
    const ref = doc(db, 'challenges', challengeId)
    await deleteDoc(ref)
    await fetchChallenges()
  }

  // === Tasks inside Challenges ===
  const getTasks = async (challengeId) => {
    const taskCol = collection(doc(db, 'challenges', challengeId), 'tasks')
    const snapshot = await getDocs(taskCol)
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
  }

  const addTask = async (challengeId, task) => {
    await addDoc(collection(doc(db, 'challenges', challengeId), 'tasks'), task)
  }

  const updateTask = async (challengeId, taskId, updated) => {
    const ref = doc(db, 'challenges', challengeId, 'tasks', taskId)
    await updateDoc(ref, updated)
  }

  const deleteTask = async (challengeId, taskId) => {
    const ref = doc(db, 'challenges', challengeId, 'tasks', taskId)
    await deleteDoc(ref)
  }

  // === Questions inside Tasks ===
  const getTaskQuestions = async (challengeId, taskId) => {
    const qCol = collection(
      doc(db, 'challenges', challengeId, 'tasks', taskId),
      'questions'
    )
    const snapshot = await getDocs(qCol)
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
  }

  const addTaskQuestion = async (challengeId, taskId, question) => {
    await addDoc(
      collection(
        doc(db, 'challenges', challengeId, 'tasks', taskId),
        'questions'
      ),
      question
    )
  }

  const updateTaskQuestion = async (challengeId, taskId, qId, updated) => {
    const ref = doc(
      db,
      'challenges',
      challengeId,
      'tasks',
      taskId,
      'questions',
      qId
    )
    await updateDoc(ref, updated)
  }

  const deleteTaskQuestion = async (challengeId, taskId, qId) => {
    const ref = doc(
      db,
      'challenges',
      challengeId,
      'tasks',
      taskId,
      'questions',
      qId
    )
    await deleteDoc(ref)
  }

  const value = {
    challenges,
    addChallenge,
    updateChallenge,
    deleteChallenge,
    getTasks,
    addTask,
    updateTask,
    deleteTask,
    getTaskQuestions,
    addTaskQuestion,
    updateTaskQuestion,
    deleteTaskQuestion,
  }

  return (
    <ChallengeContext.Provider value={value}>
      {children}
    </ChallengeContext.Provider>
  )
}
