import { zodResolver } from '@hookform/resolvers/zod'
import { Timestamp } from 'firebase/firestore'
import { useForm } from 'react-hook-form'
import { formatDateLocal } from '../utils/dateFormat'
import { getEventSchema } from '../schemas/events'


export const useCreateEvent = (activeTab, basicSubType, event, onClose) => {

  
  const {
    control,
    handleSubmit,
    register,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(getEventSchema(activeTab, basicSubType)),
    defaultValues: {
      title: event?.title || '',
      description: event?.description || '',
      imageUrl: event?.imageUrl || '',
      startAt: formatDateLocal(new Date(event?.startAt?.seconds * 1000)) || '',
      endAt: formatDateLocal(new Date(event?.endAt?.seconds * 1000)) || '',
      type:
        event?.type ||
        (activeTab === 'double'
          ? 'multiplier'
          : activeTab === 'challenge'
          ? 'quiz'
          : activeTab === 'basic' && 'welcome'),
      rules: {
        ...(activeTab === 'double' && {
          multiplier: event?.rules?.multiplier || 2,
        }),
        ...(activeTab === 'challenge' && {
          quizMinCorrect: event?.rules?.quizMinCorrect || 0,
          quizReward: event?.rules?.quizReward || 0,
        }),
        ...(activeTab === 'basic' &&
          basicSubType === 'target_points' && {
            targetGoal: event?.rules?.targetGoal || 0,
            targetReward: event?.rules?.targetReward || 0,
          }),
        ...(activeTab === 'basic' &&
          basicSubType === 'welcome' && {
            welcomeGoal: event?.rules?.welcomeGoal || 0,
            welcomeReward: event?.rules?.welcomeReward || 0,
          }),
      },
    },
  })
  const onSubmit = (data) => {
    const formData = {
      ...data,
      createdAt: event ? event?.createdAt : Timestamp.fromDate(new Date()),
    }
    onClose()
    console.log('Form Data Submitted:', formData)
    return formData
  }
  return {
    control,
    handleSubmit,
    register,
    watch,
    setValue,
    errors,
    isSubmitting,
    onSubmit
  }
}
