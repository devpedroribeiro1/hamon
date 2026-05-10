"use client";

import { useState } from "react";
import { X, Plus } from "lucide-react";

export default function ProjectsPopup({
  isOpen,
  onClose,
  projects,
  onToggleActive,
  onCreateProject,
}) {
  const [newProjectName, setNewProjectName] = useState("");

  if (!isOpen) return null;

  const activeProjects = projects.filter((p) => p.active);
  const inactiveProjects = projects.filter((p) => !p.active);

  const handleCreate = async () => {
    if (!newProjectName.trim()) return;
    await onCreateProject(newProjectName.trim());
    setNewProjectName("");
  };

  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup popup--wide" onClick={(e) => e.stopPropagation()} id="popup-projects">
        <div className="popup__header">
          <h3 className="popup__title">Projetos</h3>
          <button className="popup__close" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="projects-layout">
          <div className="projects-column">
            <h4 className="projects-column__title projects-column__title--inactive">
              Não Ativos ({inactiveProjects.length})
            </h4>
            <div className="projects-list">
              {inactiveProjects.length === 0 ? (
                <div className="block__empty" style={{ fontSize: "11px" }}>
                  Nenhum projeto inativo
                </div>
              ) : (
                inactiveProjects.map((project) => (
                  <div
                    key={project.id}
                    className="project-item"
                    onClick={() => onToggleActive(project.id, true)}
                    title="Clique para ativar"
                  >
                    <span className="project-item__name">{project.name}</span>
                    <span className="project-item__count">
                      {project._count?.cards ?? 0} cards
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="projects-column">
            <h4 className="projects-column__title projects-column__title--active">
              Ativos ({activeProjects.length})
            </h4>
            <div className="projects-list">
              {activeProjects.length === 0 ? (
                <div className="block__empty" style={{ fontSize: "11px" }}>
                  Nenhum projeto ativo
                </div>
              ) : (
                activeProjects.map((project) => (
                  <div
                    key={project.id}
                    className="project-item project-item--active"
                    onClick={() => onToggleActive(project.id, false)}
                    title="Clique para desativar"
                  >
                    <span className="project-item__name">{project.name}</span>
                    <span className="project-item__count">
                      {project._count?.cards ?? 0} cards
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="add-project-inline" style={{ marginTop: "20px" }}>
          <input
            type="text"
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
            placeholder="Nome do novo projeto"
            id="input-new-project"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleCreate();
              }
            }}
          />
          <button
            className="btn btn--primary btn--small"
            onClick={handleCreate}
            id="btn-create-project"
          >
            <Plus size={14} />
            Criar
          </button>
        </div>
      </div>
    </div>
  );
}
