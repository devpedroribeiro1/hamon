"use client";

import { X } from "lucide-react";

export default function ConfirmReplacePopup({
  isOpen,
  onClose,
  onExtend,
  onReplace,
  onCancel,
  replacingCard,
  replacedCard,
}) {
  if (!isOpen || !replacingCard || !replacedCard) return null;

  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup" onClick={(e) => e.stopPropagation()} id="popup-confirm-replace">
        <div className="popup__header">
          <h3 className="popup__title">Confirmação de Substituição</h3>
          <button className="popup__close" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "24px" }}>
          A contagem regressiva de{" "}
          <strong style={{ color: "var(--accent-purple)" }}>{replacedCard.title}</strong>{" "}
          expirou. O que deseja fazer?
        </p>

        <div className="confirm-actions">
          <button
            className="btn btn--secondary"
            onClick={onExtend}
            id="btn-extend-replace"
          >
            Prorrogar Substituição
          </button>
          <button
            className="btn btn--primary"
            onClick={onReplace}
            id="btn-do-replace"
          >
            Realizar Substituição
          </button>
          <button
            className="btn btn--danger"
            onClick={onCancel}
            id="btn-cancel-replace"
          >
            Cancelar Substituição
          </button>
        </div>
      </div>
    </div>
  );
}
