import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  increment,
  limit,
  orderBy,
  query,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore'
import { createContext, useContext, useEffect, useState } from 'react'
import { db } from '../utils/firebase'
import { toast } from 'sonner'

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
    const challengesQuery = query(
      collection(db, 'challenges'),
      orderBy('challenge_order', 'asc')
    )
    const snapshot = await getDocs(challengesQuery)
    setChallenges(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })))
  }
  // === Challenges ===

  const addChallenge = async (challenge) => {
    try {
      const lastOrder =
        challenges.length > 0
          ? challenges[challenges.length - 1].challenge_order || 0
          : 0

      const nextOrder = lastOrder + 1

      const newDocRef = doc(collection(db, 'challenges'))
      const challengeWithOrder = {
        ...challenge,
        challengeId: newDocRef.id,
        challenge_order: nextOrder,
      }

      await setDoc(newDocRef, challengeWithOrder)
      await fetchChallenges()
      toast.success('Challenge added successfully')
    } catch (error) {
      console.error('Error adding challenge:', error)
      toast.error('Failed to add challenge. Please try again.')
    }
  }

  const updateChallenge = async (challengeId, updated) => {
    const ref = doc(db, 'challenges', challengeId)
    await updateDoc(ref, updated)
    await fetchChallenges()
  }

  const deleteChallenge = async (challengeId, challengeOrder) => {
    try {
      const challengeRef = doc(db, 'challenges', challengeId)
      const tasksCol = collection(challengeRef, 'tasks')
      const usersCol = collection(challengeRef, 'users')

      const tasksSnapshot = await getDocs(tasksCol)
      const usersSnapshot = await getDocs(usersCol)

      const allQuestionsSnapshots = await Promise.all(
        tasksSnapshot.docs.map(async (taskDoc) => {
          const questionsCol = collection(taskDoc.ref, 'questions')
          return getDocs(questionsCol)
        })
      )

      const batch = writeBatch(db)

      allQuestionsSnapshots.forEach((questionsSnapshot, index) => {
        questionsSnapshot.docs.forEach((questionDoc) => {
          batch.delete(questionDoc.ref)
        })
        batch.delete(tasksSnapshot.docs[index].ref)
      })

      usersSnapshot.docs.forEach((userDoc) => {
        batch.delete(userDoc.ref)
      })

      batch.delete(challengeRef)

      const reorderQuery = query(
        collection(db, 'challenges'),
        where('challenge_order', '>', challengeOrder)
      )
      const reorderSnapshot = await getDocs(reorderQuery)

      reorderSnapshot.docs.forEach((docSnap) => {
        const docRef = doc(db, 'challenges', docSnap.id)
        const currentOrder = docSnap.data().challenge_order || 0
        batch.update(docRef, { challenge_order: currentOrder - 1 })
      })

      // Commit everything
      await batch.commit()
      await fetchChallenges()
    } catch (error) {
      console.error('Error deleting challenge:', error)
    }
  }

  const handleReorderChallenges = async (challenge1, challenge2) => {
    try {
      const tempOrder = challenge1.challenge_order
      challenge1.challenge_order = challenge2.challenge_order
      challenge2.challenge_order = tempOrder

      const batch = writeBatch(db)
      const challenge1Ref = doc(db, 'challenges', challenge1.id)
      const challenge2Ref = doc(db, 'challenges', challenge2.id)

      batch.update(challenge1Ref, {
        challenge_order: challenge1.challenge_order,
      })
      batch.update(challenge2Ref, {
        challenge_order: challenge2.challenge_order,
      })

      await batch.commit()
      toast.success('Challenges reordered successfully')
      setChallenges((prev) =>
        prev
          .map((c) => {
            if (c.id === challenge1.id) {
              return { ...c, challenge_order: challenge1.challenge_order }
            }
            if (c.id === challenge2.id) {
              return { ...c, challenge_order: challenge2.challenge_order }
            }
            return c
          })
          .sort((a, b) => a.challenge_order - b.challenge_order)
      )
    } catch (error) {
      console.error('Error reordering challenges:', error)
      toast.error('Failed to reorder challenges. Please try again.')
    }
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
    const q = query(taskCol, orderBy('userPoints', 'desc'), limit(3))
    const snapshot = await getDocs(q)
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
  }
  const value = {
    challenges,
    addChallenge,
    updateChallenge,
    deleteChallenge,
    handleReorderChallenges,
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
