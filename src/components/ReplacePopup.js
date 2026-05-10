"use client";

import { useState } from "react";
import { X } from "lucide-react";

export default function ReplacePopup({
  isOpen,
  onClose,
  onSubmit,
  replacingCard,
  replacedCard,
}) {
  const [momentType, setMomentType] = useState("instant");
  const [startDate, setStartDate] = useState("");
  const [durationType, setDurationType] = useState("indefinite");
  const [durationDate, setDurationDate] = useState("");

  if (!isOpen || !replacingCard || !replacedCard) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      replacingCardId: replacingCard.id,
      replacedCardId: replacedCard.id,
      startDate: momentType === "specific" ? startDate : null,
      duration: durationType === "specific" ? durationDate : null,
    });
  };

  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup" onClick={(e) => e.stopPropagation()} id="popup-replace">
        <div className="popup__header">
          <h3 className="popup__title">Substituição de Hábito</h3>
          <button className="popup__close" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "20px" }}>
          <strong style={{ color: "var(--accent-blue)" }}>{replacingCard.title}</strong>{" "}
          irá substituir{" "}
          <strong style={{ color: "var(--accent-purple)" }}>{replacedCard.title}</strong>
        </p>

        <form onSubmit={handleSubmit}>
          <div className="replace-options">
            <div className="replace-option">
              <label className="form-group__label">Momento da Substituição</label>
              <div className="replace-option__row">
                <label className="replace-option__radio">
                  <input
                    type="radio"
                    name="moment"
                    value="instant"
                    checked={momentType === "instant"}
                    onChange={() => setMomentType("instant")}
                  />
                  Instantâneo
                </label>
                <label className="replace-option__radio">
                  <input
                    type="radio"
                    name="moment"
                    value="specific"
                    checked={momentType === "specific"}
                    onChange={() => setMomentType("specific")}
                  />
                  Especificar dia
                </label>
              </div>
              {momentType === "specific" && (
                <input
                  type="date"
                  className="replace-option__date-input"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                  min={new Date().toISOString().split("T")[0]}
                />
              )}
            </div>

            <div className="replace-option">
              <label className="form-group__label">Duração da Substituição</label>
              <div className="replace-option__row">
                <label className="replace-option__radio">
                  <input
                    type="radio"
                    name="duration"
                    value="indefinite"
                    checked={durationType === "indefinite"}
                    onChange={() => setDurationType("indefinite")}
                  />
                  Indefinido
                </label>
                <label className="replace-option__radio">
                  <input
                    type="radio"
                    name="duration"
                    value="specific"
                    checked={durationType === "specific"}
                    onChange={() => setDurationType("specific")}
                  />
                  Especificar dia
                </label>
              </div>
              {durationType === "specific" && (
                <input
                  type="date"
                  className="replace-option__date-input"
                  value={durationDate}
                  onChange={(e) => setDurationDate(e.target.value)}
                  required
                  min={new Date().toISOString().split("T")[0]}
                />
              )}
            </div>
          </div>

          <div className="popup__actions">
            <button type="button" className="btn btn--secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn btn--primary" id="btn-submit-replace">
              Confirmar Substituição
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
