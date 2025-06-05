import {
  collection,
  getDocs,
  increment,
  query,
  updateDoc,
  where,
} from 'firebase/firestore'
import { Award, Crown, Medal, Trophy } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { useChallenge } from '../../context/ChallengeContext'
import { db } from '../../utils/firebase'
import ConfirmDialog from '../common/ConfirmDialog'

const TopUsers = ({ onClose, challenge }) => {
  const { getUsers } = useChallenge()
  const [topUsers, setTopUsers] = useState([])
  const [isGivePointsOpen, setIsGivePointsOpen] = useState(false)

  useEffect(() => {
    const fetchTasks = async () => {
      const fetchedTasks = await getUsers(challenge.id)
      setTopUsers(fetchedTasks)
    }
    fetchTasks()
  }, [challenge.id, getUsers])

  const handleGiveUsersPoints = async () => {
    try {
      const topThreeUsers = topUsers.slice(0, 3)
      const usernames = topThreeUsers.map((user) => user.username)

      const usersRef = collection(db, 'users')
      const q = query(usersRef, where('username', 'in', usernames))
      const snapshot = await getDocs(q)

      const userMap = new Map()
      snapshot.forEach((doc) => {
        userMap.set(doc.data().username, doc.ref)
      })

      for (const user of topThreeUsers) {
        const userRef = userMap.get(user.username)
        if (userRef) {
          await updateDoc(userRef, {
            pointsNumber: increment(user.userPoints),
          })
        } else {
          console.warn(`User not found in Firestore: ${user.username}`)
        }
      }
      onClose()
      toast.success('Top 3 users updated with their points!')
    } catch (error) {
      console.error('Error updating top 3 users:', error)
      toast.error('Something went wrong while updating user points.')
    }
  }

  const getRankIcon = (index) => {
    switch (index) {
      case 0:
        return <Crown className='w-6 h-6 text-yellow-500' />
      case 1:
        return <Trophy className='w-6 h-6 text-gray-400' />
      case 2:
        return <Medal className='w-6 h-6 text-amber-600' />
      default:
        return <Award className='w-6 h-6 text-gray-300' />
    }
  }
  return (
    <div className='space-y-6 h-[80vh] overflow-y-auto pr-2'>
      {/* Top Users Leaderboard */}
      <div className='bg-white'>
        <h2 className='text-xl font-semibold text-gray-900 mb-6 text-center'>
          🏆 Leaderboard
        </h2>

        <div className='space-y-3'>
          {topUsers.length > 0 ? (
            topUsers.map((user, index) => (
              <div
                key={user.id}
                className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                  index === 0
                    ? 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-300'
                    : index === 1
                    ? 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-300'
                    : index === 2
                    ? 'bg-gradient-to-r from-amber-50 to-amber-100 border-amber-300'
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-4'>
                    <div className='flex items-center gap-2'>
                      {getRankIcon(index)}
                      <span className='text-2xl font-bold text-gray-600'>
                        #{index + 1}
                      </span>
                    </div>
                    <div className='w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-white font-bold'>
                      {user.username?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className='font-semibold text-gray-900'>
                        {user.username}
                      </h3>
                      <p className='text-sm text-gray-600'>Rank {index + 1}</p>
                    </div>
                  </div>
                  <div className='text-right'>
                    <div className='text-2xl font-bold text-gray-900'>
                      {user.userPoints}
                    </div>
                    <div className='text-sm text-gray-600'>points</div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className='text-center py-12'>
              <Trophy className='w-16 h-16 text-gray-300 mx-auto mb-4' />
              <h3 className='text-lg font-medium text-gray-900 mb-2'>
                No participants yet
              </h3>
              <p className='text-gray-600'>
                Be the first to participate in this challenge!
              </p>
            </div>
          )}
        </div>
      </div>
      <ConfirmDialog
        isOpen={isGivePointsOpen}
        onClose={() => setIsGivePointsOpen(false)}
        onConfirm={handleGiveUsersPoints}
        title='Give users points'
        message='Are you sure you want to give points to the top 3 users?'
        confirmText={'Give Points'}
        cancelText='Cancel'
        type='info'
      />
      {topUsers.length >= 3 && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            setIsGivePointsOpen(true)
          }}
          className='btn btn-secondary flex items-center ms-auto'
        >
          Give Points
        </button>
      )}
    </div>
  )
}

export default TopUsers
