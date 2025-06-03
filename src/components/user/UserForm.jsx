import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { useUsers } from '../../context/UserContext'

const UserSchema = z.object({
  pointsNumber: z.number(),
})

const UserForm = ({ user, onClose }) => {
  const { changePoints } = useUsers()
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(UserSchema),
    defaultValues: {
      pointsNumber: user.pointsNumber,
    },
  })

  const onSubmit = async (data) => {
    try {
      await changePoints(user.id, data.pointsNumber)
      toast.success('Points updated successfully')
      onClose()
    } catch (error) {
      toast.error('Failed to update points')
      console.error(error)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <label
        htmlFor='points'
        className='block text-md font-medium text-gray-700'
      >
        Points
      </label>
      <input
        id='points'
        type='number'
        placeholder='Points of user'
        className='mt-1 input'
        min={0}
        {...register('pointsNumber', { valueAsNumber: true })}
      />
      <div className='flex justify-end mt-6 space-x-3'>
        <button
          type='button'
          onClick={onClose}
          className='btn btn-ghost'
        >
          Cancel
        </button>
        <button
          type='submit'
          className='btn btn-primary'
        >
          Change Points
        </button>
      </div>
    </form>
  )
}

export default UserForm
