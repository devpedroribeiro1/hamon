"use client";

import { useState, useEffect } from "react";
import { X, Plus } from "lucide-react";

export default function AddCardPopup({
  isOpen,
  onClose,
  onSubmit,
  defaultBlock,
  projects,
  onCreateProject,
}) {
  const [title, setTitle] = useState("");
  const [why, setWhy] = useState("");
  const [projectId, setProjectId] = useState("");
  const [block, setBlock] = useState(defaultBlock || "inbox");
  const [showNewProject, setShowNewProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");

  useEffect(() => {
    setBlock(defaultBlock || "inbox");
  }, [defaultBlock]);

  useEffect(() => {
    if (isOpen) {
      setTitle("");
      setWhy("");
      setProjectId("");
      setShowNewProject(false);
      setNewProjectName("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSubmit({
      title: title.trim(),
      why: why.trim() || null,
      projectId: projectId || null,
      block,
    });
  };

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) return;
    const newProject = await onCreateProject(newProjectName.trim());
    if (newProject) {
      setProjectId(newProject.id);
      setShowNewProject(false);
      setNewProjectName("");
    }
  };

  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup" onClick={(e) => e.stopPropagation()} id="popup-add-card">
        <div className="popup__header">
          <h3 className="popup__title">Novo Hábito</h3>
          <button className="popup__close" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-group__label" htmlFor="card-title">
              Título *
            </label>
            <input
              type="text"
              id="card-title"
              className="form-group__input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nome do hábito"
              autoFocus
              required
            />
          </div>

          <div className="form-group">
            <label className="form-group__label" htmlFor="card-why">
              Porquê
            </label>
            <textarea
              id="card-why"
              className="form-group__textarea"
              value={why}
              onChange={(e) => setWhy(e.target.value)}
              placeholder="Por que esse hábito é importante para você?"
              rows={3}
            />
          </div>

          <div className="form-group">
            <label className="form-group__label" htmlFor="card-project">
              Projeto Atrelado
            </label>
            <select
              id="card-project"
              className="form-group__select"
              value={projectId}
              onChange={(e) => {
                if (e.target.value === "__new__") {
                  setShowNewProject(true);
                  setProjectId("");
                } else {
                  setProjectId(e.target.value);
                }
              }}
            >
              <option value="">Nenhum</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
              <option value="__new__">+ Novo Projeto</option>
            </select>

            {showNewProject && (
              <div className="add-project-inline" style={{ marginTop: "8px" }}>
                <input
                  type="text"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="Nome do projeto"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleCreateProject();
                    }
                  }}
                />
                <button
                  type="button"
                  className="btn btn--primary btn--small"
                  onClick={handleCreateProject}
                >
                  <Plus size={14} />
                </button>
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-group__label" htmlFor="card-block">
              Bloco
            </label>
            <select
              id="card-block"
              className="form-group__select"
              value={block}
              onChange={(e) => setBlock(e.target.value)}
            >
              <option value="inbox">Inbox</option>
              <option value="active">Active</option>
              <option value="archive">Archive</option>
            </select>
          </div>

          <div className="popup__actions">
            <button type="button" className="btn btn--secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn btn--primary" id="btn-submit-card">
              Criar Hábito
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
