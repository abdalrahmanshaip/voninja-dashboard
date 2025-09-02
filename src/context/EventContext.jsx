import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  setDoc,
  updateDoc,
  writeBatch,
} from 'firebase/firestore'
import PropTypes from 'prop-types'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'
import { db } from '../utils/firebase'

const EventContext = createContext()

export const useEvents = () => {
  const context = useContext(EventContext)
  if (!context) {
    throw new Error('useEvents must be used within an EventProvider')
  }
  return context
}

export const EventProvider = ({ children }) => {
  const [events, setEvents] = useState([])
  const [questions, setQuestions] = useState([])
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = useCallback(async () => {
    try {
      const eventsQuery = query(
        collection(db, 'events'),
        orderBy('order', 'asc')
      )
      const snapshot = await getDocs(eventsQuery)
      const eventsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      setEvents(eventsData)
      setError(null)
    } catch (err) {
      setError('Failed to fetch events')
      console.error('Error fetching events:', err)
    }
  }, [])

  const addEvent = useCallback(
    async (eventData) => {
      try {
        const lastOrder =
          events.length > 0 ? events[events.length - 1].order || 0 : 0

        const nextOrder = lastOrder + 1
        const newEvent = {
          ...eventData,
          order: nextOrder,
        }
        setEvents((prev) => [...prev, newEvent])

        const docRef = await addDoc(collection(db, 'events'), newEvent)
        setEvents((prev) =>
          prev.map((event) =>
            event === newEvent ? { ...newEvent, id: docRef.id } : event
          )
        )
        return docRef.id
      } catch (err) {
        setEvents((prev) => prev.filter((event) => event !== eventData))
        setError('Failed to add event')
        console.error('Error adding event:', err)
        throw err
      }
    },
    [events]
  )

  const updateEvent = useCallback(
    async (eventId, eventData) => {
      try {
        const eventRef = doc(db, 'events', eventId)

        setEvents((prev) =>
          prev.map((event) =>
            event.id === eventId ? { ...event, ...eventData } : event
          )
        )

        await updateDoc(eventRef, eventData)
      } catch (err) {
        fetchEvents()
        setError('Failed to update event')
        console.error('Error updating event:', err)
        throw err
      }
    },
    [fetchEvents]
  )

  const deleteEvent = useCallback(
    async (eventId) => {
      try {
        const eventRef = doc(db, 'events', eventId)

        const eventToDelete = events.find((e) => e.id === eventId)

        setEvents((prev) => prev.filter((event) => event.id !== eventId))

        const batch = writeBatch(db)

        if (eventToDelete?.type === 'quiz') {
          const questionsRef = collection(db, 'events', eventId, 'questions')
          const questionsSnap = await getDocs(questionsRef)

          questionsSnap.forEach((qDoc) => {
            batch.delete(qDoc.ref)
          })
        }

        batch.delete(eventRef)

        await batch.commit()
      } catch (err) {
        fetchEvents()
        setError('Failed to delete event')
        console.error('Error deleting event:', err)
        throw err
      }
    },
    [events, fetchEvents]
  )

  const updateEventsOrder = useCallback(
    async (reorderedEvents) => {
      const batch = writeBatch(db)

      try {
        setEvents(reorderedEvents)

        reorderedEvents.forEach((event) => {
          const eventRef = doc(db, 'events', event.id)
          batch.update(eventRef, { order: event.order })
        })

        await batch.commit()
      } catch (err) {
        fetchEvents()
        setError('Failed to reorder events')
        console.error('Error reordering events:', err)
        throw err
      }
    },
    [fetchEvents]
  )

  const fetchQuestions = useCallback(async (eventId) => {
    try {
      const questionsQuery = query(
        collection(db, 'events', eventId, 'questions')
      )
      const snapshot = await getDocs(questionsQuery)
      const questionsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      setQuestions(questionsData)
      return questionsData
    } catch (err) {
      setError('Failed to fetch questions')
      console.error('Error fetching questions:', err)
      throw err
    }
  }, [])

  const addQuestion = useCallback(async (eventId, questionData) => {
    const newDocRef = doc(collection(db, 'events', eventId, 'questions'))

    const questionId = newDocRef.id

    const newQuestion = { ...questionData, id: questionId }

    setQuestions((prev) => [...prev, newQuestion])

    try {
      const docRef = await setDoc(newDocRef, newQuestion)
      setEvents((prev) =>
        prev.map((question) =>
          question === newQuestion
            ? { ...newQuestion, id: docRef.id }
            : question
        )
      )

      return questionId
    } catch (err) {
      setQuestions((prev) =>
        prev.filter((question) => question !== questionData)
      )

      setError('Failed to add question')

      console.error('Error adding question:', err)

      throw err
    }
  }, [])

  const updateQuestion = useCallback(
    async (eventId, questionId, questionData) => {
      try {
        setQuestions((prev) =>
          prev.map((question) =>
            question.id === questionId
              ? { ...question, ...questionData }
              : question
          )
        )

        const questionRef = doc(db, 'events', eventId, 'questions', questionId)
        await updateDoc(questionRef, questionData)
      } catch (err) {
        fetchQuestions(eventId)
        setError('Failed to update question')
        console.error('Error updating question:', err)
        throw err
      }
    },
    [fetchQuestions]
  )

  const deleteQuestion = useCallback(async (eventId, questionId) => {
    try {
      setQuestions((prev) =>
        prev.filter((question) => question.id !== questionId)
      )

      const questionRef = doc(db, 'events', eventId, 'questions', questionId)
      await deleteDoc(questionRef)
    } catch (err) {
      setError('Failed to delete question')
      console.error('Error deleting question:', err)
      throw err
    }
  }, [])

  const value = {
    events,
    questions,
    setQuestions,
    error,
    fetchEvents,
    addEvent,
    updateEvent,
    deleteEvent,
    updateEventsOrder,
    fetchQuestions,
    addQuestion,
    updateQuestion,
    deleteQuestion,
  }

  return <EventContext.Provider value={value}>{children}</EventContext.Provider>
}

EventProvider.propTypes = {
  children: PropTypes.node.isRequired,
}

export default EventContext
