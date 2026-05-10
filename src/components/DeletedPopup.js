"use client";

import { X, RotateCcw, FolderOpen } from "lucide-react";

export default function DeletedPopup({ isOpen, onClose, cards, onRestore }) {
  if (!isOpen) return null;

  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup popup--wide" onClick={(e) => e.stopPropagation()} id="popup-deleted">
        <div className="popup__header">
          <h3 className="popup__title">Hábitos Deletados</h3>
          <button className="popup__close" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        {cards.length === 0 ? (
          <div className="block__empty" style={{ margin: "20px 0" }}>
            Nenhum hábito deletado
          </div>
        ) : (
          <div className="deleted-cards-list">
            {cards.map((card) => (
              <div key={card.id} className="habit-card habit-card--deleted" id={`deleted-card-${card.id}`}>
                <div className="habit-card__header">
                  <span className="habit-card__title">{card.title}</span>
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
                    {card.previousBlock && (
                      <span style={{
                        fontSize: "11px",
                        color: "var(--text-muted)",
                        fontStyle: "italic",
                      }}>
                        de: {card.previousBlock}
                      </span>
                    )}
                  </div>
                  <button
                    className="habit-card__restore-btn"
                    onClick={() => onRestore(card.id)}
                    title="Restaurar"
                  >
                    <RotateCcw size={12} />
                    Restaurar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
