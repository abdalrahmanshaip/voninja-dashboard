import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  increment,
  orderBy,
  query,
  setDoc,
  updateDoc,
  where
} from 'firebase/firestore'
import { createContext, useContext, useEffect, useState } from 'react'
import { db } from '../utils/firebase'

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
    const questionRef = doc(db, 'challenges', challengeId)
    const tasksSnapshot = await getDocs(
      query(collection(questionRef, 'tasks'), orderBy('order'))
    )
    const tasks = tasksSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
    const lastTaskOrder = tasks.length > 0 ? tasks[tasks.length - 1].order : 0

    const taskRef = doc(collection(questionRef, 'tasks'))
    const taskWithId = {
      ...task,
      id: taskRef.id,
      order: lastTaskOrder + 1,
    }

    await updateDoc(questionRef, {
      numberOfTasks: increment(1),
    })

    await setDoc(taskRef, taskWithId)
  }

  const updateTask = async (challengeId, taskId, updated) => {
    const ref = doc(db, 'challenges', challengeId, 'tasks', taskId)
    await updateDoc(ref, updated)
  }

  const deleteTask = async (challengeId, taskId) => {
    const challengeRef = doc(db, 'challenges', challengeId)

    const taskRef = doc(db, 'challenges', challengeId, 'tasks', taskId)
    const taskSnap = await getDoc(taskRef)
    if (!taskSnap.exists()) return

    const deletedOrder = taskSnap.data().order

    const questionsRef = collection(
      db,
      'challenges',
      challengeId,
      'tasks',
      taskId,
      'questions'
    )
    const questionsSnapshot = await getDocs(questionsRef)
    const deleteQuestionsPromises = questionsSnapshot.docs.map((doc) =>
      deleteDoc(doc.ref)
    )
    await Promise.all(deleteQuestionsPromises)

    await deleteDoc(taskRef)

    await updateDoc(challengeRef, {
      numberOfTasks: increment(-1),
    })

    const tasksQuery = query(
      collection(db, 'challenges', challengeId, 'tasks'),
      where('order', '>', deletedOrder)
    )
    const tasksSnapshot = await getDocs(tasksQuery)

    const updatePromises = tasksSnapshot.docs.map((docSnap) => {
      const currentOrder = docSnap.data().order
      return updateDoc(docSnap.ref, {
        order: currentOrder - 1,
      })
    })

    await Promise.all(updatePromises)
  }

  const getTaskQuestions = async (challengeId, taskId) => {
    const qCol = collection(
      doc(db, 'challenges', challengeId, 'tasks', taskId),
      'questions'
    )
    const snapshot = await getDocs(qCol)
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
  }

  const addTaskQuestion = async (challengeId, taskId, question) => {
    await updateDoc(doc(db, 'challenges', challengeId), {
      totalQuestions: increment(1),
    })
    await updateDoc(doc(db, 'challenges', challengeId, 'tasks', taskId), {
      numQuestions: increment(1),
    })
    const questionRef = doc(
      collection(
        doc(db, 'challenges', challengeId, 'tasks', taskId),
        'questions'
      )
    )
    const questionWithId = {
      ...question,
      questionId: questionRef.id,
    }
    await setDoc(questionRef, questionWithId)
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
    await updateDoc(doc(db, 'challenges', challengeId), {
      totalQuestions: increment(-1),
    })
    await updateDoc(doc(db, 'challenges', challengeId, 'tasks', taskId), {
      numQuestions: increment(-1),
    })
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

  const getUsers = async (challengeId) => {
    const taskCol = collection(doc(db, 'challenges', challengeId), 'users')
    const q = query(taskCol, orderBy('userPoints', 'desc'))
    const snapshot = await getDocs(q)
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
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
    getUsers,
  }

  return (
    <ChallengeContext.Provider value={value}>
      {children}
    </ChallengeContext.Provider>
  )
}
