"use client";

export default function DragOverlayCard({ card }) {
  return (
    <div className="habit-card habit-card--overlay drag-overlay-wrapper">
      <div className="habit-card__header">
        <span className="habit-card__title">{card.title}</span>
      </div>
      {card.why && <p className="habit-card__why">{card.why}</p>}
      <div className="habit-card__footer">
        {card.project && (
          <span className="habit-card__project">{card.project.name}</span>
        )}
      </div>
    </div>
  );
}
