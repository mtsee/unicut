import { useState, useCallback, useRef, memo, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SortableItemProps {
  id: string;
  className?: string;
  draggingClassName?: string;
  children: React.ReactNode;
}

const SortableItem = memo(({ id, className, draggingClassName, children }: SortableItemProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    willChange: isDragging ? 'transform' : undefined,
    position: 'relative' as const,
    zIndex: isDragging ? 999 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`${className || ''} ${isDragging && draggingClassName ? draggingClassName : ''}`}
    >
      {children}
    </div>
  );
});

SortableItem.displayName = 'SortableItem';

export interface VerticalSortableListProps<T> {
  items: T[];
  getId: (item: T) => string;
  renderItem: (item: T) => React.ReactNode;
  onDragEnd: (items: T[]) => void;
  itemClassName?: string;
  draggingClassName?: string;
}

export function VerticalSortableList<T>({
  items,
  getId,
  renderItem,
  onDragEnd,
  itemClassName,
  draggingClassName,
}: VerticalSortableListProps<T>) {
  const [localItems, setLocalItems] = useState(items);
  const prevItemsRef = useRef(items);

  useEffect(() => {
    if (prevItemsRef.current !== items) {
      prevItemsRef.current = items;
      setLocalItems(items);
    }
  }, [items]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (over && active.id !== over.id) {
        const oldIndex = localItems.findIndex(item => getId(item) === active.id);
        const newIndex = localItems.findIndex(item => getId(item) === over.id);
        const newItems = arrayMove(localItems, oldIndex, newIndex);
        prevItemsRef.current = newItems;
        setLocalItems(newItems);
        onDragEnd(newItems);
      }
    },
    [localItems, getId, onDragEnd],
  );

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={localItems.map(item => getId(item))} strategy={verticalListSortingStrategy}>
        {localItems.map(item => (
          <SortableItem
            key={getId(item)}
            id={getId(item)}
            className={itemClassName}
            draggingClassName={draggingClassName}
          >
            {renderItem(item)}
          </SortableItem>
        ))}
      </SortableContext>
    </DndContext>
  );
}
