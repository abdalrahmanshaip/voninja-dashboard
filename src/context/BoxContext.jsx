import {
  collectionGroup,
  doc,
  getDoc,
  getDocs,
  updateDoc
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
import { useUsers } from './UserContext'

const BoxContext = createContext()

export const useBoxes = () => {
  const context = useContext(BoxContext)
  if (!context) {
    throw new Error('useBoxes must be used within a BoxProvider')
  }
  return context
}

export const BoxProvider = ({ children }) => {
  const { users } = useUsers()
  const [boxesOpenedByUser, setBoxesOpenedByUser] = useState([])

  const [boxes, setBoxes] = useState({
    tiers: {
      bronze: [],
      silver: [],
      gold: [],
    },
  })
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const fetchBoxes = useCallback(async () => {
    setLoading(true)
    try {
      const treasureRef = doc(db, 'treasure', 'hivmoPbiFoXbVnMsK4IM')
      const treasureSnap = await getDoc(treasureRef)

      if (treasureSnap.exists()) {
        const treasureData = treasureSnap.data()

        if (treasureData) {
          const boxesWithIds = {
            ...treasureData,
            tiers: {
              bronze: ensureBoxesHaveIds(
                treasureData.tiers?.bronze || [],
                'bronze'
              ),
              silver: ensureBoxesHaveIds(
                treasureData.tiers?.silver || [],
                'silver'
              ),
              gold: ensureBoxesHaveIds(treasureData.tiers?.gold || [], 'gold'),
            },
          }
          setBoxes(boxesWithIds)
        } else {
          setBoxes({
            tiers: {
              bronze: [],
              silver: [],
              gold: [],
            },
          })
        }
        setError(null)
      } else {
        throw new Error('Treasure document not found')
      }
    } catch (err) {
      setError('Failed to fetch boxes')
      console.error('Error fetching boxes:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const ensureBoxesHaveIds = (boxes, tier) => {
    return boxes.map((box, index) => {
      if (!box.id) {
        return {
          ...box,
          id: `${tier[0]}${Date.now()}-${index}`,
          index,
        }
      }
      return { ...box, index }
    })
  }

  const removeFieldsFromBoxes = (boxes, selectedTier) => {
    // eslint-disable-next-line no-unused-vars
    return boxes.tiers[selectedTier].map(({ id, tier, ...rest }) => rest)
  }

  const addBox = useCallback(
    async (boxData, selectedTier) => {
      const { tier, minPoints, minAds, rewardPoints } = boxData

      try {
        const nextIndex = boxes.tiers[tier].length

        const uniqueId = `${tier[0]}${Date.now()}`

        const newBox = {
          id: uniqueId,
          tier,
          condition: {
            minPoints,
            minAds,
          },
          rewardPoints,
          index: nextIndex,
        }

        const updatedBoxes = {
          ...boxes,
          tiers: {
            ...boxes.tiers,
            [tier]: [...boxes.tiers[tier], newBox],
          },
        }

        setBoxes(updatedBoxes)

        const processedData = removeFieldsFromBoxes(updatedBoxes, selectedTier)

        const treasureRef = doc(db, 'treasure', 'hivmoPbiFoXbVnMsK4IM')
        await updateDoc(treasureRef, {
          [`tiers.${tier}`]: processedData,
        })

        return uniqueId
      } catch (err) {
        fetchBoxes()
        setError('Failed to add box')
        console.error('Error adding box:', err)
        throw err
      }
    },
    [boxes, fetchBoxes]
  )

  const updateBox = useCallback(
    async (boxId, boxData, selectedTier) => {
      const { tier, minPoints, minAds, rewardPoints } = boxData

      try {
        const boxToUpdate = boxes.tiers[tier].find((box) => box.id === boxId)

        if (!boxToUpdate) {
          throw new Error(`Box with ID ${boxId} not found in tier ${tier}`)
        }

        const updatedBox = {
          ...boxToUpdate,
          condition: {
            minPoints,
            minAds,
          },
          rewardPoints,
        }

        const updatedTier = boxes.tiers[tier].map((box) =>
          box.id === boxId ? updatedBox : box
        )

        const updatedBoxes = {
          ...boxes,
          tiers: {
            ...boxes.tiers,
            [tier]: updatedTier,
          },
        }

        setBoxes(updatedBoxes)

        const processedData = removeFieldsFromBoxes(updatedBoxes, selectedTier)

        const treasureRef = doc(db, 'treasure', 'hivmoPbiFoXbVnMsK4IM')
        await updateDoc(treasureRef, {
          [`tiers.${tier}`]: processedData,
        })

        return boxId
      } catch (err) {
        fetchBoxes()
        setError('Failed to update box')
        console.error('Error updating box:', err)
        throw err
      }
    },
    [boxes, fetchBoxes]
  )

  const deleteBox = useCallback(
    async (boxId, tier) => {
      try {
        const boxToDelete = boxes.tiers[tier].find((box) => box.id === boxId)

        if (!boxToDelete) {
          throw new Error(`Box with ID ${boxId} not found in tier ${tier}`)
        }

        const filteredTier = boxes.tiers[tier].filter((box) => box.id !== boxId)

        const updatedTier = filteredTier.map((box, idx) => ({
          ...box,
          index: idx,
        }))

        const updatedBoxes = {
          ...boxes,
          tiers: {
            ...boxes.tiers,
            [tier]: updatedTier,
          },
        }
        setBoxes(updatedBoxes)

        const processedData = removeFieldsFromBoxes(updatedBoxes, tier)

        const treasureRef = doc(db, 'treasure', 'hivmoPbiFoXbVnMsK4IM')
        await updateDoc(treasureRef, {
          [`tiers.${tier}`]: processedData,
        })

        return boxId
      } catch (err) {
        fetchBoxes()
        setError('Failed to delete box')
        console.error('Error deleting box:', err)
        throw err
      }
    },
    [boxes, fetchBoxes]
  )

  const fetchBoxesOpenedByUser = useCallback(async () => {
    setLoading(true)
    try {
      const snap = await getDocs(collectionGroup(db, 'treasure'))

      const usersMap = new Map(users.map((u) => [String(u.id ?? ''), u]))

      const merged = []
      snap.docs.forEach((boxDoc) => {
        const parentUserRef = boxDoc.ref.parent.parent
        if (!parentUserRef?.id) return
        const user = usersMap.get(parentUserRef.id)
        if (!user) return
        merged.push({
          userData: {
            username: user.username,
            email: user.email,
            phoneNumber: user.phoneNumber,
          },
          box: {
            ...boxDoc.data(),
          },
        })
      })

      setBoxesOpenedByUser(merged)
    } catch (err) {
      console.error('fetchUsersWithEvents error:', err)
      setBoxesOpenedByUser([])
    } finally {
      setLoading(false)
    }
  }, [users])

  useEffect(() => {
    fetchBoxes()
    fetchBoxesOpenedByUser()
  }, [fetchBoxes, fetchBoxesOpenedByUser])

  const value = {
    boxes,
    boxesOpenedByUser,
    loading,
    error,
    fetchBoxes,
    addBox,
    updateBox,
    deleteBox,
  }

  return <BoxContext.Provider value={value}>{children}</BoxContext.Provider>
}

BoxProvider.propTypes = {
  children: PropTypes.node.isRequired,
}

export default BoxContext
