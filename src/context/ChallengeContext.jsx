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
  Timestamp,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore'
import PropTypes from 'prop-types'
import { createContext, useContext, useEffect, useState } from 'react'
import { toast } from 'sonner'
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
        id: newDocRef.id,
        challengeId: newDocRef.id,
        challenge_order: nextOrder,
      }

      await setDoc(newDocRef, challengeWithOrder)

      // ✅ Update local state
      setChallenges((prev) => [...prev, challengeWithOrder])
    } catch (error) {
      console.error('Error adding challenge:', error)
      toast.error('Failed to add challenge. Please try again.')
    }
  }

  const updateChallenge = async (challengeId, updated) => {
    const ref = doc(db, 'challenges', challengeId)
    await updateDoc(ref, updated)

    // ✅ Update local state
    setChallenges((prev) =>
      prev.map((ch) => (ch.id === challengeId ? { ...ch, ...updated } : ch))
    )
  }

  const deleteChallenge = async (challengeId, challengeOrder) => {
    try {
      const challengeRef = doc(db, 'challenges', challengeId)
      const tasksCol = collection(challengeRef, 'tasks')
      const usersCol = collection(challengeRef, 'users')

      const tasksSnapshot = await getDocs(tasksCol)
      const usersSnapshot = await getDocs(usersCol)

      // Collect all questions for each task
      const allQuestionsSnapshots = await Promise.all(
        tasksSnapshot.docs.map(async (taskDoc) => {
          const questionsCol = collection(taskDoc.ref, 'questions')
          return getDocs(questionsCol)
        })
      )

      const batch = writeBatch(db)

      // Delete all questions & tasks
      allQuestionsSnapshots.forEach((questionsSnapshot, index) => {
        questionsSnapshot.docs.forEach((questionDoc) => {
          batch.delete(questionDoc.ref)
        })
        batch.delete(tasksSnapshot.docs[index].ref)
      })

      // Delete all users
      usersSnapshot.docs.forEach((userDoc) => {
        batch.delete(userDoc.ref)
      })

      // Delete the challenge itself
      batch.delete(challengeRef)

      // Reorder other challenges (Firestore update)
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

      await batch.commit()

      // ✅ Update local state
      setChallenges(
        (prev) =>
          prev
            .filter((ch) => ch.id !== challengeId) // remove deleted challenge
            .map((ch) =>
              ch.challenge_order > challengeOrder
                ? { ...ch, challenge_order: ch.challenge_order - 1 }
                : ch
            )
            .sort((a, b) => a.challenge_order - b.challenge_order) // keep order consistent
      )
    } catch (error) {
      console.error('Error deleting challenge:', error)
      toast.error('Failed to delete challenge. Please try again.')
    }
  }

  const addTask = async (challengeId, task) => {
    const challengeRef = doc(db, 'challenges', challengeId)
    const tasksSnapshot = await getDocs(
      query(collection(challengeRef, 'tasks'), orderBy('order'))
    )
    const tasks = tasksSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
    const lastTaskOrder = tasks.length > 0 ? tasks[tasks.length - 1].order : 0

    const taskRef = doc(collection(challengeRef, 'tasks'))
    const taskWithId = {
      ...task,
      id: taskRef.id,
      order: lastTaskOrder + 1,
      numQuestions: 0,
    }

    await updateDoc(challengeRef, {
      numberOfTasks: increment(1),
    })

    await setDoc(taskRef, taskWithId)

    // ✅ Update local state
    setChallenges((prev) =>
      prev.map((ch) =>
        ch.id === challengeId
          ? {
              ...ch,
              numberOfTasks: (ch.numberOfTasks || 0) + 1,
              tasks: ch.tasks ? [...ch.tasks, taskWithId] : [taskWithId],
            }
          : ch
      )
    )
  }

  const updateTask = async (challengeId, taskId, updated) => {
    const ref = doc(db, 'challenges', challengeId, 'tasks', taskId)
    await updateDoc(ref, updated)

    // ✅ Update local state
    setChallenges((prev) =>
      prev.map((ch) =>
        ch.id === challengeId
          ? {
              ...ch,
              tasks: ch.tasks?.map((t) =>
                t.id === taskId ? { ...t, ...updated } : t
              ),
            }
          : ch
      )
    )
  }

  const deleteTask = async (challengeId, taskId) => {
    try {
      // مراجع
      const challengeRef = doc(db, 'challenges', challengeId)
      const taskRef = doc(db, 'challenges', challengeId, 'tasks', taskId)

      // 1) جِب الـ task snapshot ورتّب الـ order منه
      const taskSnap = await getDoc(taskRef)
      if (!taskSnap.exists()) {
        console.warn('Task not found:', taskId)
        return
      }
      const deletedOrder = taskSnap.data().order ?? 0

      // 2) جِب كل الأسئلة داخل الـ task
      const questionsRef = collection(
        db,
        'challenges',
        challengeId,
        'tasks',
        taskId,
        'questions'
      )
      const questionsSnapshot = await getDocs(questionsRef)

      const batch = writeBatch(db)

      questionsSnapshot.docs.forEach((qDoc) => {
        batch.delete(qDoc.ref)
      })

      batch.delete(taskRef)

      batch.update(challengeRef, { numberOfTasks: increment(-1) })

      const reorderQuery = query(
        collection(db, 'challenges', challengeId, 'tasks'),
        where('order', '>', deletedOrder)
      )
      const reorderSnapshot = await getDocs(reorderQuery)

      reorderSnapshot.docs.forEach((docSnap) => {
        const otherTaskRef = doc(
          db,
          'challenges',
          challengeId,
          'tasks',
          docSnap.id
        )
        const currentOrder = docSnap.data().order ?? 0
        batch.update(otherTaskRef, { order: currentOrder - 1 })
      })

      // 5) commit
      await batch.commit()

      setChallenges((prev) =>
        prev.map((ch) => {
          if (ch.id !== challengeId) return ch

          const prevTasks = ch.tasks ?? []

          const updatedTasks = prevTasks
            .filter((t) => t.id !== taskId)
            .map((t) =>
              (t.order ?? 0) > deletedOrder
                ? { ...t, order: (t.order ?? 0) - 1 }
                : t
            )
            .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))

          return {
            ...ch,
            numberOfTasks: Math.max(0, (ch.numberOfTasks ?? 1) - 1),
            tasks: updatedTasks,
          }
        })
      )
    } catch (error) {
      console.error('Error deleting task:', error)
      toast.error('Failed to delete task. Please try again.')
    }
  }

  const addTaskQuestion = async (challengeId, taskId, question) => {
    const batch = writeBatch(db)

    const challengeRef = doc(db, 'challenges', challengeId)
    const taskRef = doc(db, 'challenges', challengeId, 'tasks', taskId)
    const questionRef = doc(collection(taskRef, 'questions'))

    const questionWithId = {
      ...question,
      questionId: questionRef.id,
      createdAt: Timestamp.fromDate(new Date()),
    }

    batch.update(challengeRef, { totalQuestions: increment(1) })
    batch.update(taskRef, { numQuestions: increment(1) })
    batch.set(questionRef, questionWithId)

    await batch.commit()

    setChallenges((prev) =>
      prev.map((ch) =>
        ch.id === challengeId
          ? {
              ...ch,
              totalQuestions: (ch.totalQuestions || 0) + 1,
              tasks: ch.tasks.map((t) =>
                t.id === taskId
                  ? {
                      ...t,
                      numQuestions: (t.numQuestions || 0) + 1,
                      questions: t.questions
                        ? [...t.questions, questionWithId]
                        : [questionWithId],
                    }
                  : t
              ),
            }
          : ch
      )
    )
  }

  const handlePasteTaskQuestions = async (challengeId, taskId) => {
    const text = await navigator.clipboard.readText()
    const parsed = JSON.parse(text)

    const batch = writeBatch(db)
    const challengeRef = doc(db, 'challenges', challengeId)
    const taskRef = doc(db, 'challenges', challengeId, 'tasks', taskId)
    const questionsRef = collection(taskRef, 'questions')

    const now = Timestamp.fromDate(new Date())

    const newQuestions = parsed.map((q) => {
      const newDoc = doc(questionsRef)
      const questionWithId = {
        ...q,
        questionId: newDoc.id,
        createdAt: now,
      }
      batch.set(newDoc, questionWithId)
      return questionWithId
    })

    batch.update(challengeRef, {
      totalQuestions: increment(newQuestions.length),
    })
    batch.update(taskRef, { numQuestions: increment(newQuestions.length) })

    await batch.commit()

    // ✅ Update local state
    setChallenges((prev) =>
      prev.map((ch) =>
        ch.id === challengeId
          ? {
              ...ch,
              totalQuestions: (ch.totalQuestions || 0) + newQuestions.length,
              tasks: ch.tasks.map((t) =>
                t.id === taskId
                  ? {
                      ...t,
                      numQuestions: (t.numQuestions || 0) + newQuestions.length,
                      questions: t.questions
                        ? [...t.questions, ...newQuestions]
                        : [...newQuestions],
                    }
                  : t
              ),
            }
          : ch
      )
    )

    toast.success(`${newQuestions.length} question(s) added!`)
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

  const getTaskQuestions = async (challengeId, taskId) => {
    const qCol = collection(
      doc(db, 'challenges', challengeId, 'tasks', taskId),
      'questions'
    )
    const snapshot = await getDocs(qCol)
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
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
    handlePasteTaskQuestions,
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

ChallengeProvider.propTypes = {
  children: PropTypes.node.isRequired,
}

export default ChallengeContext
