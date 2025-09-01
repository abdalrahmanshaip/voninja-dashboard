import { closestCenter, DndContext } from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { useState } from 'react'

import PropTypes from 'prop-types'
import SortableItem from './SortableItem'

const ReorderEvents = ({ events, onClose }) => {
  const [items, setItems] = useState(events)
  const [isChange, setIsChange] = useState(false)

  const handleDragEnd = (event) => {
    const { active, over } = event
    if (active.id !== over.id) {
      setItems((prev) => {
        const oldIndex = prev.findIndex((i) => i.id === active.id)
        const newIndex = prev.findIndex((i) => i.id === over.id)
        setIsChange(true)
        return arrayMove(prev, oldIndex, newIndex)
      })
    }
  }

  console.log(items)

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
          type='submit'
          className={` ${
            !isChange ? ' btn-disabled text-white' : 'btn btn-primary'
          }`}
          disabled={!isChange}
        >
            Save
        </button>
      </div>
    </div>
  )
}

export default ReorderEvents

ReorderEvents.propTypes = {
  events: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string,
      description: PropTypes.string,
      imageUrl: PropTypes.string,
      startAt: PropTypes.shape({
        seconds: PropTypes.func,
      }),
      endAt: PropTypes.shape({
        seconds: PropTypes.func,
      }),
      createdAt: PropTypes.any,
      type: PropTypes.string,
      rules: PropTypes.object,
      order: PropTypes.number
    })
  ),
  onClose: PropTypes.func.isRequired,
}
