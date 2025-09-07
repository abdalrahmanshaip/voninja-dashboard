import { zodResolver } from '@hookform/resolvers/zod'
import { Timestamp } from 'firebase/firestore'
import { useForm } from 'react-hook-form'
import { formatDateLocal, normalizeToDate } from '../utils/dateFormat'
import { getEventSchema } from '../schemas/events'
import { uploadImage } from '../utils/UploadImage'
import { useEvents } from '../context/EventContext'
import { toast } from 'sonner'

export const useCreateEvent = (activeTab, basicSubType, event, onClose) => {
  const { updateEvent, addEvent, error } = useEvents()
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
      startAt:
        (!(activeTab === 'basic' && basicSubType === 'welcome') &&
          event?.startAt &&
          formatDateLocal(normalizeToDate(event.startAt))) ||
        '',

      endAt:
        (!(activeTab === 'basic' && basicSubType === 'welcome') &&
          event?.endAt &&
          formatDateLocal(normalizeToDate(event.endAt))) ||
        '',
      type:
        event?.type ||
        (activeTab === 'double'
          ? 'multiplier'
          : activeTab === 'challenge'
          ? 'quiz'
          : activeTab === 'basic' && 'target_points'),
      rules: {
        ...(activeTab === 'double' && {
          multiplier: event?.rules?.multiplier || 2,
        }),
        ...(activeTab === 'challenge' && {
          quizMinCorrect: event?.rules?.quizMinCorrect || 0,
          quizReward: event?.rules?.quizReward || 0,
          quizTotal: event?.rules?.quizTotal || 0,
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
  const onSubmit = async (data) => {
    let url = ''
    try {
      if (typeof data.imageUrl === 'string' && data.imageUrl.length > 0) {
        url = data.imageUrl
      } else if (data.imageUrl instanceof File) {
        url = await uploadImage(data.imageUrl)
      }
      const formData = {
        ...data,
        order: event?.order,
        imageUrl: url,
        createdAt: event ? event?.createdAt : Timestamp.fromDate(new Date()),
      }
      if (event) {
        await updateEvent(event.id, formData)
        toast.success('Event updated successfully')
      } else {
        await addEvent(formData)
        toast.success('Event added successfully')
      }
      onClose()
    } catch {
      console.error('Error submitting question:', error)
      toast.error(error || 'Failed to save question')
    }
  }

  return {
    control,
    handleSubmit,
    register,
    watch,
    setValue,
    errors,
    isSubmitting,
    onSubmit,
  }
}
