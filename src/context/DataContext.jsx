import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  increment,
  orderBy,
  query,
  setDoc,
  updateDoc,
  writeBatch
} from 'firebase/firestore'
import PropTypes from 'prop-types'
import { createContext, useContext, useState } from 'react'
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

  // === Lessons by Level ===
  const getLessons = async (levelId) => {
    const cacheKey = `${levelId}`

    if (data.lessons[cacheKey]) {
      return {
        lessons: data.lessons[cacheKey],
      }
    }

    const levelRef = doc(db, 'levels', levelId)
    const lessonsCol = collection(levelRef, 'lessons')

    let queryRef = query(lessonsCol, orderBy('lesson_order'))

    const snapshot = await getDocs(queryRef)
    let lessons = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
    setData((prev) => ({
      ...prev,
      lessons: {
        ...prev.lessons,
        [cacheKey]: lessons,
      },
    }))
    return { lessons }
  }

  const addLesson = async (levelId, lesson) => {
    const levelRef = doc(db, 'levels', levelId)
    await updateDoc(levelRef, {
      totalLessons: increment(1),
    })

    const lessonsCol = collection(levelRef, 'lessons')
    const snapshot = await getDocs(query(lessonsCol, orderBy('lesson_order')))
    const lessons = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
    const lastLessonOrder =
      lessons.length > 0 ? lessons[lessons.length - 1].lesson_order : 0

    const batch = writeBatch(db)
    const newLessonRef = doc(lessonsCol)
    const lessonWithId = {
      ...lesson,
      id: newLessonRef.id,
      lesson_order: lastLessonOrder + 1,
    }
    batch.set(newLessonRef, lessonWithId)

    await batch.commit()

    setData((prev) => ({
      ...prev,
      lessons: {
        ...prev.lessons,
        [levelId]: prev.lessons[levelId]
          ? [...prev.lessons[levelId], lessonWithId]
          : [lessonWithId],
      },
    }))
  }

  const updateLesson = async (levelId, lessonId, updated) => {
    const lessonRef = doc(db, 'levels', levelId, 'lessons', lessonId)
    await updateDoc(lessonRef, updated)
    setData((prev) => ({
      ...prev,
      lessons: {
        ...prev.lessons,
        [levelId]: prev.lessons[levelId].map((lesson) =>
          lesson.id === lessonId ? { ...lesson, ...updated } : lesson
        ),
      },
    }))
  }

  const deleteLesson = async (levelId, lessonId) => {
    const levelRef = doc(db, 'levels', levelId)
    const lessonsCol = collection(levelRef, 'lessons')
    const snapshot = await getDocs(query(lessonsCol, orderBy('lesson_order')))
    const lessons = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
    const deletedLesson = lessons.find((lesson) => lesson.id === lessonId)

    if (!deletedLesson) return

    const batch = writeBatch(db)

    batch.delete(doc(lessonsCol, lessonId))

    lessons
      .filter((l) => l.lesson_order > deletedLesson.lesson_order)
      .forEach((l) => {
        batch.update(doc(lessonsCol, l.id), {
          lesson_order: l.lesson_order - 1,
        })
      })

    await batch.commit()

    await updateDoc(levelRef, {
      totalLessons: increment(-1),
    })

    setData((prev) => ({
      ...prev,
      lessons: {
        ...prev.lessons,
        [levelId]: prev.lessons[levelId].filter(
          (lesson) => lesson.id !== lessonId
        ),
      },
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
      const lessonRef = doc(db, 'levels', levelId, 'lessons', lessonId)
      await updateDoc(doc(db, 'levels', levelId), {
        totalQuestions: increment(-1),
      })
      await updateDoc(lessonRef, {
        numQuestions: increment(-1),
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
  }

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

DataProvider.propTypes = {
  children: PropTypes.node.isRequired,
}

export default DataContext
