"use client";

import {
  useDroppable,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Plus } from "lucide-react";
import HabitCard from "./HabitCard";

const BLOCK_LABELS = {
  inbox: "Inbox",
  active: "Active",
  archive: "Archive",
};

export default function Block({ blockId, cards, onAddCard, onDeleteCard }) {
  const { setNodeRef, isOver } = useDroppable({
    id: `block-${blockId}`,
    data: {
      type: "block",
      blockId,
    },
  });

  const cardIds = cards.map((c) => c.id);

  const blockClass = [
    "block",
    `block--${blockId}`,
    isOver ? "block--drag-over" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={blockClass} id={`block-${blockId}`}>
      <div className="block__header">
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <h2 className={`block__title block__title--${blockId}`}>
            {BLOCK_LABELS[blockId]}
          </h2>
          <span className="block__count">{cards.length}</span>
        </div>
        <button
          className="block__add-btn"
          onClick={() => onAddCard(blockId)}
          title={`Adicionar hábito ao ${BLOCK_LABELS[blockId]}`}
          id={`add-card-${blockId}`}
        >
          <Plus size={16} />
        </button>
      </div>
      <SortableContext
        items={cardIds}
        strategy={verticalListSortingStrategy}
      >
        <div className="block__cards" ref={setNodeRef}>
          {cards.length === 0 ? (
            <div className="block__empty">
              Arraste um hábito para cá
            </div>
          ) : (
            cards.map((card) => (
              <HabitCard
                key={card.id}
                card={card}
                onDelete={onDeleteCard}
              />
            ))
          )}
        </div>
      </SortableContext>
    </div>
  );
}
