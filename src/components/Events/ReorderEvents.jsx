import { closestCenter, DndContext } from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { useMemo, useState } from 'react'

import PropTypes from 'prop-types'
import { toast } from 'sonner'
import { useEvents } from '../../context/EventContext'
import LoadingSpinner from '../common/LoadingSpinner'
import SortableItem from './SortableItem'

const ReorderEvents = ({ events, onClose }) => {
  const { updateEventsOrder, error } = useEvents()
  const [items, setItems] = useState(events)
  const [loading, setLoading] = useState(false)

  const handleDragEnd = (event) => {
    const { active, over } = event
    if (active.id !== over.id) {
      setItems((prev) => {
        const oldIndex = prev.findIndex((i) => i.id === active.id)
        const newIndex = prev.findIndex((i) => i.id === over.id)
        return arrayMove(prev, oldIndex, newIndex)
      })
    }
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      const reorderedWithOrder = items.map((event, index) => ({
        ...event,
        order: 1 + index,
      }))
      await updateEventsOrder(reorderedWithOrder)
      toast.success('Events reordered successfully')
      onClose()
    } catch {
      toast.error(error || 'Failed to delete coupon')
    } finally {
      setLoading(false)
    }
  }

    const isChanged = useMemo(() => {
    if (items.length !== events.length) return true
    return items.some((item, idx) => item.id !== events[idx].id)
  }, [items, events])

  return (
    <div className='text-black'>
      <DndContext
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={items}
          strategy={verticalListSortingStrategy}
        >
          {items.map((event) => (
            <SortableItem
              key={event.id}
              event={event}
            />
          ))}
        </SortableContext>
      </DndContext>

      <div className='flex justify-end gap-2 mt-4'>
        <button
          type='button'
          onClick={onClose}
          className='btn btn-ghost'
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          type='submit'
          className={` ${
            !isChanged  || loading
              ? ' btn-disabled text-white'
              : 'btn btn-primary'
          }`}
          disabled={!isChanged }
        >
          {loading ? (
            <div className='flex gap-1'>
              <LoadingSpinner />
              Saving
            </div>
          ) : (
            'Save'
          )}
        </button>
      </div>
    </div>
  )
}

export default ReorderEvents

ReorderEvents.propTypes = {
  events: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      title: PropTypes.string,
      description: PropTypes.string,
      imageUrl: PropTypes.string,
      createdAt: PropTypes.any,
      type: PropTypes.string,
      rules: PropTypes.object,
      order: PropTypes.number,
    })
  ),
  onClose: PropTypes.func.isRequired,
}
