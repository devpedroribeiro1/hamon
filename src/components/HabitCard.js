"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { X, Clock, FolderOpen, History } from "lucide-react";

function formatCountdown(endDate) {
  if (!endDate) return null;
  const now = new Date();
  const end = new Date(endDate);
  const diffMs = end - now;
  if (diffMs <= 0) return "Expirado";
  const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  return `${days}d restante${days > 1 ? "s" : ""}`;
}

export default function HabitCard({ card, onDelete, isOverlay = false }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: card.id,
    data: {
      type: "card",
      card,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const countdown = formatCountdown(card.countdownEnd);

  const cardClass = [
    "habit-card",
    isDragging ? "habit-card--dragging" : "",
    isOverlay ? "habit-card--overlay" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cardClass}
      id={`card-${card.id}`}
      {...attributes}
      {...listeners}
    >
      <div className="habit-card__header">
        <span className="habit-card__title">{card.title}</span>
        {!isOverlay && onDelete && (
          <button
            className="habit-card__delete-btn"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(card.id);
            }}
            title="Deletar"
          >
            <X size={12} />
          </button>
        )}
      </div>

      {card.why && <p className="habit-card__why">{card.why}</p>}

      <div className="habit-card__footer">
        <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
          {card.project && (
            <span className="habit-card__project">
              <FolderOpen size={10} />
              {card.project.name}
            </span>
          )}
          {countdown && (
            <span className="habit-card__countdown">
              <Clock size={10} />
              {countdown}
            </span>
          )}
        </div>
        {card.stateHistory && card.stateHistory.length > 0 && (
          <span className="habit-card__history-badge">
            <History size={10} />
            {card.stateHistory.length}
          </span>
        )}
      </div>
    </div>
  );
}
