import { closestCenter, DndContext } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import PropTypes from "prop-types";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useEvents } from "../../context/EventContext";
import LoadingSpinner from "../common/LoadingSpinner";

const SortableQuestion = ({ question, index }) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: question.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="flex items-center gap-3 p-3 border rounded mb-2 bg-white shadow-sm cursor-grab select-none"
    >
      <span className="text-sm font-bold text-gray-400 w-6 text-center">
        {index + 1}
      </span>
      <p className="flex-1 text-sm text-gray-800 truncate">
        {question.content}
      </p>
      <span className="text-xs text-gray-400 bg-gray-100 rounded px-2 py-0.5">
        ≡
      </span>
    </div>
  );
};

SortableQuestion.propTypes = {
  question: PropTypes.shape({
    id: PropTypes.string.isRequired,
    content: PropTypes.string,
  }).isRequired,
  index: PropTypes.number.isRequired,
};

const ReorderQuestions = ({ eventId, questions, onClose }) => {
  const { updateQuestionsOrder } = useEvents();
  const [items, setItems] = useState(() =>
    [...questions].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
  );
  const [loading, setLoading] = useState(false);

  const handleDragEnd = ({ active, over }) => {
    if (active.id !== over?.id) {
      setItems((prev) => {
        const oldIndex = prev.findIndex((q) => q.id === active.id);
        const newIndex = prev.findIndex((q) => q.id === over.id);
        return arrayMove(prev, oldIndex, newIndex);
      });
    }
  };

  const isChanged = useMemo(() => {
    const sorted = [...questions].sort(
      (a, b) => (a.order ?? 0) - (b.order ?? 0),
    );
    return items.some((item, idx) => item.id !== sorted[idx]?.id);
  }, [items, questions]);

  const handleSave = async () => {
    setLoading(true);
    try {
      const reordered = items.map((q, idx) => ({ ...q, order: idx + 1 }));
      await updateQuestionsOrder(eventId, reordered);
      toast.success("Questions reordered successfully");
      onClose();
    } catch {
      toast.error("Failed to reorder questions");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext
          items={items.map((q) => q.id)}
          strategy={verticalListSortingStrategy}
        >
          {items.map((q, idx) => (
            <SortableQuestion key={q.id} question={q} index={idx} />
          ))}
        </SortableContext>
      </DndContext>

      <div className="flex justify-end gap-2 mt-4">
        <button type="button" onClick={onClose} className="btn btn-ghost">
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={!isChanged || loading}
          className={
            !isChanged || loading
              ? "btn-disabled text-white"
              : "btn btn-primary"
          }
        >
          {loading ? (
            <div className="flex gap-1">
              <LoadingSpinner />
              Saving
            </div>
          ) : (
            "Save Order"
          )}
        </button>
      </div>
    </div>
  );
};

ReorderQuestions.propTypes = {
  eventId: PropTypes.string.isRequired,
  questions: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      content: PropTypes.string,
      order: PropTypes.number,
    }),
  ).isRequired,
  onClose: PropTypes.func.isRequired,
};

export default ReorderQuestions;
