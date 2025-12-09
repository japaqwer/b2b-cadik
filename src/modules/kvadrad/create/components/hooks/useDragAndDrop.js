import {
  useSensors,
  useSensor,
  PointerSensor,
  TouchSensor,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { useCallback } from "react";

export function useDragAndDrop() {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 250, tolerance: 5 },
    })
  );

  const handleDragEnd = useCallback((items, setItems) => {
    return (event) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      setItems((prevItems) => {
        const oldIndex = prevItems.findIndex((i) => i.id === active.id);
        const newIndex = prevItems.findIndex((i) => i.id === over.id);

        if (oldIndex === -1 || newIndex === -1) return prevItems;

        return arrayMove(prevItems, oldIndex, newIndex);
      });
    };
  }, []);

  return { sensors, handleDragEnd };
}
