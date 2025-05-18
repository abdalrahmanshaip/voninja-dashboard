import { createContext, useContext, useEffect, useState } from 'react'
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  increment,
  setDoc,
} from 'firebase/firestore'
import { db } from '../utils/firebase'

const DataContext = createContext()
export const useData = () => useContext(DataContext)

export const DataProvider = ({ children }) => {
  const [data, setData] = useState({
    lessons: [],
    levels: [],
    challenges: [],
    tasks: [],
  })

  useEffect(() => {
    fetchInitialData()
  }, [])

  const fetchInitialData = async () => {
    const [levelsSnap, challengesSnap] = await Promise.all([
      getDocs(collection(db, 'levels')),
      // getDocs(collection(db, 'challenges')),
    ])

    setData((prev) => ({
      ...prev,
      levels: levelsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
      // challenges: challengesSnap.docs.map((doc) => ({
      //   id: doc.id,
      //   ...doc.data(),
      // })),
    }))
  }

  // === Lessons by Level ===
  const getLessons = async (levelId, lastVisible = null) => {
    const levelRef = doc(db, 'levels', levelId)
    const lessonsCol = collection(levelRef, 'lessons')

    let queryRef = query(lessonsCol, orderBy('lesson_order'), limit(10))

    if (lastVisible) {
      queryRef = query(
        lessonsCol,
        orderBy('lesson_order'),
        startAfter(lastVisible),
        limit(10)
      )
    }

    const snapshot = await getDocs(queryRef)
    const lessons = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))

    return {
      lessons,
      lastVisible: snapshot.docs[snapshot.docs.length - 1] || null,
      hasMore: snapshot.docs.length === 10,
    }
  }

  const addLesson = async (levelId, lesson) => {
    const levelRef = doc(db, 'levels', levelId)
    await updateDoc(levelRef, {
      totalLessons: increment(1),
    })

    const newLessonRef = doc(collection(levelRef, 'lessons')) // توليد ID
    const lessonWithId = { ...lesson, id: newLessonRef.id }

    await setDoc(newLessonRef, lessonWithId)

    setData((prev) => ({
      ...prev,
      lessons: [...prev.lessons, lessonWithId],
    }))
  }

  const updateLesson = async (levelId, lessonId, updated) => {
    const lessonRef = doc(db, 'levels', levelId, 'lessons', lessonId)
    await updateDoc(lessonRef, updated)
    setData((prev) => ({
      ...prev,
      lessons: prev.lessons.map((lesson) =>
        lesson.id === lessonId ? { ...lesson, ...updated } : lesson
      ),
    }))
  }

  const deleteLesson = async (levelId, lessonId) => {
    const lessonRef = doc(db, 'levels', levelId, 'lessons', lessonId)
    const levelRef = doc(db, 'levels', levelId)
    await updateDoc(levelRef, {
      totalLessons: increment(-1),
    })
    await deleteDoc(lessonRef)
    setData((prev) => ({
      ...prev,
      lessons: prev.lessons.filter((lesson) => lesson.id !== lessonId),
    }))
  }

  // === Vocabulary inside Lessons ===
  const getVocabularies = async (levelId, lessonId) => {
    const vocabCol = collection(
      doc(db, 'levels', levelId, 'lessons', lessonId),
      'vocabulary'
    )
    const snapshot = await getDocs(vocabCol)
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
  }

  const addVocabulary = async (levelId, lessonId, vocab) => {
    try {
      const vocabRef = doc(
        collection(
          doc(db, 'levels', levelId, 'lessons', lessonId),
          'vocabulary'
        )
      )
      const vocabWithId = { ...vocab, id: vocabRef.id }

      await setDoc(vocabRef, vocabWithId)

      const updatedVocabs = await getVocabularies(levelId, lessonId)
      setData((prev) => ({
        ...prev,
        vocabularies: updatedVocabs,
      }))
      return updatedVocabs
    } catch (error) {
      console.error('Error adding vocabulary:', error)
      throw error
    }
  }
  const updateVocabulary = async (levelId, lessonId, vocabId, updated) => {
    try {
      const ref = doc(
        db,
        'levels',
        levelId,
        'lessons',
        lessonId,
        'vocabulary',
        vocabId
      )
      await updateDoc(ref, updated)
      const updatedVocabs = await getVocabularies(levelId, lessonId)
      setData((prev) => ({
        ...prev,
        vocabularies: updatedVocabs,
      }))
      return updatedVocabs
    } catch (error) {
      console.error('Error updating vocabulary:', error)
      throw error
    }
  }

  const deleteVocabulary = async (levelId, lessonId, vocabId) => {
    try {
      const ref = doc(
        db,
        'levels',
        levelId,
        'lessons',
        lessonId,
        'vocabulary',
        vocabId
      )
      await deleteDoc(ref)
      const updatedVocabs = await getVocabularies(levelId, lessonId)
      setData((prev) => ({
        ...prev,
        vocabularies: updatedVocabs,
      }))
      return updatedVocabs
    } catch (error) {
      console.error('Error deleting vocabulary:', error)
      throw error
    }
  }

  // === Questions inside Lessons ===
  const getQuestions = async (levelId, lessonId) => {
    const qCol = collection(
      doc(db, 'levels', levelId, 'lessons', lessonId),
      'questions'
    )
    const snapshot = await getDocs(qCol)
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
  }

  const addQuestion = async (levelId, lessonId, question) => {
    try {
      const qRef = doc(
        collection(doc(db, 'levels', levelId, 'lessons', lessonId), 'questions')
      )
      const questionWithId = { ...question, id: qRef.id }

      await setDoc(qRef, questionWithId)

      const levelRef = doc(db, 'levels', levelId)
      const lessonRef = doc(db, 'levels', levelId, 'lessons', lessonId)

      await updateDoc(levelRef, {
        totalQuestions: increment(1),
      })
      await updateDoc(lessonRef, {
        numQuestions: increment(1),
      })

      const updatedQuestions = await getQuestions(levelId, lessonId)
      setData((prev) => ({
        ...prev,
        questions: updatedQuestions,
      }))
      return updatedQuestions
    } catch (error) {
      console.error('Error adding question:', error)
      throw error
    }
  }

  const updateQuestion = async (levelId, lessonId, qId, updated) => {
    try {
      const ref = doc(
        db,
        'levels',
        levelId,
        'lessons',
        lessonId,
        'questions',
        qId
      )
      await updateDoc(ref, updated)
      const updatedQuestions = await getQuestions(levelId, lessonId)
      setData((prev) => ({
        ...prev,
        questions: updatedQuestions,
      }))
      return updatedQuestions
    } catch (error) {
      console.error('Error updating question:', error)
      throw error
    }
  }

  const deleteQuestion = async (levelId, lessonId, qId) => {
    try {
      const ref = doc(
        db,
        'levels',
        levelId,
        'lessons',
        lessonId,
        'questions',
        qId
      )
      await deleteDoc(ref)
      const updatedQuestions = await getQuestions(levelId, lessonId)
      const levelRef = doc(db, 'levels', levelId)
      const lessonRef = doc(db, 'levels', levelId, 'lessons', lessonId)
      await updateDoc(levelRef, {
        totalQuestions: increment(1),
      })
      await updateDoc(lessonRef, {
        numQuestions: increment(1),
      })
      setData((prev) => ({
        ...prev,
        questions: updatedQuestions,
      }))
      return updatedQuestions
    } catch (error) {
      console.error('Error deleting question:', error)
      throw error
    }
  }

  // === Tasks inside Challenges ===
  // const getTasks = async (challengeId) => {
  //   const taskCol = collection(doc(db, 'challenges', challengeId), 'tasks')
  //   const snapshot = await getDocs(taskCol)
  //   return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
  // }

  // const addTask = async (challengeId, task) => {
  //   await addDoc(collection(doc(db, 'challenges', challengeId), 'tasks'), task)
  // }

  // const updateTask = async (challengeId, taskId, updated) => {
  //   const ref = doc(db, 'challenges', challengeId, 'tasks', taskId)
  //   await updateDoc(ref, updated)
  // }

  // const deleteTask = async (challengeId, taskId) => {
  //   const ref = doc(db, 'challenges', challengeId, 'tasks', taskId)
  //   await deleteDoc(ref)
  // }

  // // === Questions inside Tasks ===
  // const getTaskQuestions = async (challengeId, taskId) => {
  //   const qCol = collection(
  //     doc(db, 'challenges', challengeId, 'tasks', taskId),
  //     'questions'
  //   )
  //   const snapshot = await getDocs(qCol)
  //   return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
  // }

  // const addTaskQuestion = async (challengeId, taskId, question) => {
  //   await addDoc(
  //     collection(
  //       doc(db, 'challenges', challengeId, 'tasks', taskId),
  //       'questions'
  //     ),
  //     question
  //   )
  // }

  // const updateTaskQuestion = async (challengeId, taskId, qId, updated) => {
  //   const ref = doc(
  //     db,
  //     'challenges',
  //     challengeId,
  //     'tasks',
  //     taskId,
  //     'questions',
  //     qId
  //   )
  //   await updateDoc(ref, updated)
  // }

  // const deleteTaskQuestion = async (challengeId, taskId, qId) => {
  //   const ref = doc(
  //     db,
  //     'challenges',
  //     challengeId,
  //     'tasks',
  //     taskId,
  //     'questions',
  //     qId
  //   )
  //   await deleteDoc(ref)
  // }

  //

  const value = {
    data,
    getLessons,
    addLesson,
    updateLesson,
    deleteLesson,
    getVocabularies,
    addVocabulary,
    updateVocabulary,
    deleteVocabulary,
    getQuestions,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    // getTasks,
    // addTask,
    // updateTask,
    // deleteTask,
    // getTaskQuestions,
    // addTaskQuestion,
    // updateTaskQuestion,
    // deleteTaskQuestion,
  }

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export default DataContext
