import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import PropTypes from 'prop-types'

const SortableItem = ({ event }) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: event.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className='flex items-center p-4 border rounded mb-3 bg-white shadow-sm cursor-grab'
    >
      <img
        src={event.imageUrl}
        alt={event.title}
        className='w-20 h-20 object-cover rounded mr-4 border'
      />
      <div className='flex-1'>
        <div className='font-semibold text-lg'>{event.title}</div>
        <div className='text-gray-600 text-sm mb-1'>{event.description}</div>
        <span className='inline-block px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium'>
          {event.type}
        </span>
      </div>
    </div>
  )
}

export default SortableItem

SortableItem.propTypes = {
  event: PropTypes.shape({
    id: PropTypes.string,

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
  }),
}
