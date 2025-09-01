import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
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
  const [questions, setQuestions] = useState({}) // Store questions by eventId
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchEvents()
  }, [])

  // Fetch all events ordered by order field
  const fetchEvents = useCallback(async () => {
    setLoading(true)
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
    } finally {
      setLoading(false)
    }
  }, [])

  // Add new event
  const addEvent = useCallback(async (eventData) => {
    try {
      const lastOrder = events.length > 0 ? events[events.length - 1].order || 0 : 0

      const nextOrder = lastOrder + 1
      // Optimistic update
      const newEvent = {
        ...eventData,
        order: nextOrder
      }
      setEvents((prev) => [...prev, newEvent])

      // Actual API call
      const docRef = await addDoc(collection(db, 'events'), newEvent)
      setEvents((prev) =>
        prev.map((event) =>
          event === newEvent ? { ...newEvent, id: docRef.id } : event
        )
      )
      return docRef.id
    } catch (err) {
      // Rollback optimistic update
      setEvents((prev) => prev.filter((event) => event !== eventData))
      setError('Failed to add event')
      console.error('Error adding event:', err)
      throw err
    }
  }, [events])

  // Update event
  const updateEvent = useCallback(
    async (eventId, eventData) => {
      try {
        const eventRef = doc(db, 'events', eventId)

        // Optimistic update
        setEvents((prev) =>
          prev.map((event) =>
            event.id === eventId ? { ...event, ...eventData } : event
          )
        )

        // Actual API call
        await updateDoc(eventRef, eventData)
      } catch (err) {
        // Rollback optimistic update
        fetchEvents() // Refetch to ensure consistency
        setError('Failed to update event')
        console.error('Error updating event:', err)
        throw err
      }
    },
    [fetchEvents]
  )

  // Delete event
  const deleteEvent = useCallback(
    async (eventId) => {
      try {
        const eventRef = doc(db, 'events', eventId)

        // Store event for potential rollback
        const eventToDelete = events.find((e) => e.id === eventId)

        // Optimistic update
        setEvents((prev) => prev.filter((event) => event.id !== eventId))

        // If it's a quiz event, delete all associated questions
        if (eventToDelete.type === 'quiz') {
          const batch = writeBatch(db)
          const questionsQuery = query(
            collection(db, 'events', eventId, 'questions')
          )
          const questionsDocs = await getDocs(questionsQuery)
          questionsDocs.forEach((doc) => {
            batch.delete(doc.ref)
          })
          batch.delete(eventRef)
          await batch.commit()
        } else {
          await deleteDoc(eventRef)
        }
      } catch (err) {
        // Rollback optimistic update
        fetchEvents() // Refetch to ensure consistency
        setError('Failed to delete event')
        console.error('Error deleting event:', err)
        throw err
      }
    },
    [events, fetchEvents]
  )

  // Update events order
  const updateEventsOrder = useCallback(
    async (reorderedEvents) => {
      const batch = writeBatch(db)
      try {
        // Optimistic update
        setEvents(reorderedEvents)

        // Batch update all events with new order
        reorderedEvents.forEach((event) => {
          const eventRef = doc(db, 'events', event.id)
          batch.update(eventRef, { order: event.order })
        })

        await batch.commit()
      } catch (err) {
        // Rollback optimistic update
        fetchEvents() // Refetch to ensure consistency
        setError('Failed to reorder events')
        console.error('Error reordering events:', err)
        throw err
      }
    },
    [fetchEvents]
  )

  // Quiz Questions Operations
  const fetchQuestions = useCallback(async (eventId) => {
    try {
      const questionsQuery = query(
        collection(db, 'events', eventId, 'questions'),
        orderBy('order', 'asc')
      )
      const snapshot = await getDocs(questionsQuery)
      const questionsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      // Update local state
      setQuestions((prev) => ({
        ...prev,
        [eventId]: questionsData,
      }))
      return questionsData
    } catch (err) {
      setError('Failed to fetch questions')
      console.error('Error fetching questions:', err)
      throw err
    }
  }, [])

  const addQuestion = useCallback(async (eventId, questionData) => {
    try {
      // Prepare the new question with temporary ID
      const tempId = 'temp-' + Date.now()
      const newQuestion = {
        id: tempId,
        ...questionData,
      }

      // Optimistic update
      setQuestions((prev) => ({
        ...prev,
        [eventId]: [...(prev[eventId] || []), newQuestion],
      }))

      // Actual API call
      const questionsCol = collection(db, 'events', eventId, 'questions')
      const docRef = await addDoc(questionsCol, {
        ...questionData,
      })

      // Update local state with real ID
      setQuestions((prev) => ({
        ...prev,
        [eventId]: prev[eventId].map((q) =>
          q.id === tempId ? { ...newQuestion, id: docRef.id } : q
        ),
      }))

      return docRef.id
    } catch (err) {
      // Rollback optimistic update
      setQuestions((prev) => ({
        ...prev,
        [eventId]: prev[eventId].filter((q) => !q.id.startsWith('temp-')),
      }))
      setError('Failed to add question')
      console.error('Error adding question:', err)
      throw err
    }
  }, [])

  const updateQuestion = useCallback(
    async (eventId, questionId, questionData) => {
      try {
        // Optimistic update
        setQuestions((prev) => ({
          ...prev,
          [eventId]: prev[eventId].map((q) =>
            q.id === questionId ? { ...q, ...questionData } : q
          ),
        }))

        // Actual API call
        const questionRef = doc(db, 'events', eventId, 'questions', questionId)
        await updateDoc(questionRef, questionData)
      } catch (err) {
        // Rollback optimistic update
        fetchQuestions(eventId) // Refetch to ensure consistency
        setError('Failed to update question')
        console.error('Error updating question:', err)
        throw err
      }
    },
    [fetchQuestions]
  )

  const deleteQuestion = useCallback(
    async (eventId, questionId) => {
      // Store question for potential rollback
      const questionToDelete = questions[eventId]?.find(
        (q) => q.id === questionId
      )
      try {
        // Optimistic update
        setQuestions((prev) => ({
          ...prev,
          [eventId]: prev[eventId].filter((q) => q.id !== questionId),
        }))

        // Actual API call
        const questionRef = doc(db, 'events', eventId, 'questions', questionId)
        await deleteDoc(questionRef)
      } catch (err) {
        // Rollback optimistic update
        if (questionToDelete) {
          setQuestions((prev) => ({
            ...prev,
            [eventId]: [...prev[eventId], questionToDelete],
          }))
        }
        setError('Failed to delete question')
        console.error('Error deleting question:', err)
        throw err
      }
    },
    [questions]
  )

  const value = {
    events,
    questions,
    loading,
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
