"use client";

import { Trash2, FolderKanban } from "lucide-react";

export default function TopMenu({ onOpenDeleted, onOpenProjects }) {
  return (
    <header className="top-menu" id="top-menu">
      <div className="top-menu__logo">
        <div className="top-menu__logo-icon">H</div>
        <span className="top-menu__logo-text">HAMON</span>
      </div>
      <nav className="top-menu__actions">
        <button
          className="top-menu__btn top-menu__btn--projects"
          onClick={onOpenProjects}
          id="btn-projects"
          title="Projetos"
        >
          <FolderKanban size={16} />
          Projetos
        </button>
        <button
          className="top-menu__btn top-menu__btn--danger"
          onClick={onOpenDeleted}
          id="btn-deleted"
          title="Deletados"
        >
          <Trash2 size={16} />
          Deletados
        </button>
      </nav>
    </header>
  );
}
