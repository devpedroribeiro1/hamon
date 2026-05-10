"use client";

import { useState, useEffect, useCallback } from "react";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";

import TopMenu from "@/components/TopMenu";
import Block from "@/components/Block";
import DragOverlayCard from "@/components/DragOverlayCard";
import AddCardPopup from "@/components/AddCardPopup";
import ReplacePopup from "@/components/ReplacePopup";
import ConfirmReplacePopup from "@/components/ConfirmReplacePopup";
import DeletedPopup from "@/components/DeletedPopup";
import ProjectsPopup from "@/components/ProjectsPopup";

export default function Home() {
  // Data state
  const [cards, setCards] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Drag state
  const [activeCard, setActiveCard] = useState(null);

  // Popup state
  const [addCardOpen, setAddCardOpen] = useState(false);
  const [addCardBlock, setAddCardBlock] = useState("inbox");
  const [deletedOpen, setDeletedOpen] = useState(false);
  const [projectsOpen, setProjectsOpen] = useState(false);
  const [replacePopup, setReplacePopup] = useState({
    open: false,
    replacingCard: null,
    replacedCard: null,
  });
  const [confirmReplace, setConfirmReplace] = useState({
    open: false,
    replacingCard: null,
    replacedCard: null,
  });

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // ===== FETCH DATA =====
  const fetchCards = useCallback(async () => {
    try {
      const res = await fetch("/api/cards");
      const data = await res.json();
      setCards(data);
    } catch (err) {
      console.error("Failed to fetch cards:", err);
    }
  }, []);

  const fetchProjects = useCallback(async () => {
    try {
      const res = await fetch("/api/projects");
      const data = await res.json();
      setProjects(data);
    } catch (err) {
      console.error("Failed to fetch projects:", err);
    }
  }, []);

  useEffect(() => {
    Promise.all([fetchCards(), fetchProjects()]).then(() => setLoading(false));
  }, [fetchCards, fetchProjects]);

  // ===== COUNTDOWN CHECKER =====
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      cards.forEach((card) => {
        if (
          card.countdownEnd &&
          new Date(card.countdownEnd) <= now &&
          card.replacedById &&
          card.block !== "deleted" &&
          card.block !== "archive"
        ) {
          const replacingCard = cards.find((c) => c.id === card.replacedById);
          if (replacingCard) {
            setConfirmReplace({
              open: true,
              replacingCard,
              replacedCard: card,
            });
          }
        }
      });
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [cards]);

  // ===== HELPERS =====
  const getBlockCards = (blockId) =>
    cards
      .filter((c) => c.block === blockId)
      .sort((a, b) => a.position - b.position);

  const findCardBlock = (cardId) => {
    const card = cards.find((c) => c.id === cardId);
    return card ? card.block : null;
  };

  // ===== CARD ACTIONS =====
  const handleAddCard = (blockId) => {
    setAddCardBlock(blockId);
    setAddCardOpen(true);
  };

  const handleSubmitCard = async (cardData) => {
    try {
      const res = await fetch("/api/cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cardData),
      });
      if (res.ok) {
        await fetchCards();
        setAddCardOpen(false);
      }
    } catch (err) {
      console.error("Failed to create card:", err);
    }
  };

  const handleDeleteCard = async (cardId) => {
    try {
      const res = await fetch(`/api/cards/${cardId}`, { method: "DELETE" });
      if (res.ok) {
        await fetchCards();
      }
    } catch (err) {
      console.error("Failed to delete card:", err);
    }
  };

  const handleRestoreCard = async (cardId) => {
    try {
      const res = await fetch(`/api/cards/${cardId}/restore`, {
        method: "PATCH",
      });
      if (res.ok) {
        await fetchCards();
      }
    } catch (err) {
      console.error("Failed to restore card:", err);
    }
  };

  // ===== PROJECT ACTIONS =====
  const handleCreateProject = async (name) => {
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (res.ok) {
        const newProject = await res.json();
        await fetchProjects();
        return newProject;
      }
    } catch (err) {
      console.error("Failed to create project:", err);
    }
    return null;
  };

  const handleToggleProjectActive = async (projectId, active) => {
    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active }),
      });
      if (res.ok) {
        await fetchProjects();
      }
    } catch (err) {
      console.error("Failed to toggle project:", err);
    }
  };

  // ===== REPLACE ACTIONS =====
  const handleReplaceSubmit = async (replaceData) => {
    try {
      const res = await fetch("/api/cards/replace", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(replaceData),
      });
      if (res.ok) {
        await fetchCards();
        setReplacePopup({ open: false, replacingCard: null, replacedCard: null });
      }
    } catch (err) {
      console.error("Failed to replace card:", err);
    }
  };

  const handleConfirmExtend = async () => {
    // Prorrogar: adiciona 7 dias ao countdown
    const card = confirmReplace.replacedCard;
    try {
      const newEnd = new Date();
      newEnd.setDate(newEnd.getDate() + 7);
      await fetch(`/api/cards/${card.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          countdownEnd: newEnd.toISOString(),
        }),
      });
      await fetchCards();
      setConfirmReplace({ open: false, replacingCard: null, replacedCard: null });
    } catch (err) {
      console.error("Failed to extend replacement:", err);
    }
  };

  const handleConfirmReplace = async () => {
    // Realizar substituição
    try {
      await handleReplaceSubmit({
        replacingCardId: confirmReplace.replacingCard.id,
        replacedCardId: confirmReplace.replacedCard.id,
      });
      setConfirmReplace({ open: false, replacingCard: null, replacedCard: null });
    } catch (err) {
      console.error("Failed to confirm replacement:", err);
    }
  };

  const handleConfirmCancel = async () => {
    // Cancelar substituição: limpar referências
    const cardY = confirmReplace.replacedCard;
    try {
      await fetch(`/api/cards/${cardY.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          replacedById: null,
          countdownStart: null,
          countdownEnd: null,
        }),
      });
      await fetchCards();
      setConfirmReplace({ open: false, replacingCard: null, replacedCard: null });
    } catch (err) {
      console.error("Failed to cancel replacement:", err);
    }
  };

  // ===== DRAG & DROP =====
  const handleDragStart = (event) => {
    const { active } = event;
    const card = cards.find((c) => c.id === active.id);
    setActiveCard(card || null);
  };

  const handleDragOver = (event) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const activeBlock = findCardBlock(activeId);
    let overBlock;

    // Check if dropping on a block directly
    if (String(overId).startsWith("block-")) {
      overBlock = String(overId).replace("block-", "");
    } else {
      overBlock = findCardBlock(overId);
    }

    if (!activeBlock || !overBlock || activeBlock === overBlock) return;

    // Move card between blocks optimistically
    setCards((prev) => {
      const activeCard = prev.find((c) => c.id === activeId);
      if (!activeCard) return prev;

      const updated = prev.map((c) => {
        if (c.id === activeId) {
          return { ...c, block: overBlock };
        }
        return c;
      });

      return updated;
    });
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveCard(null);

    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    // Determine destination block
    let destBlock;
    if (String(overId).startsWith("block-")) {
      destBlock = String(overId).replace("block-", "");
    } else {
      destBlock = findCardBlock(overId);
    }

    const activeCardData = cards.find((c) => c.id === activeId);
    if (!activeCardData) return;

    const sourceBlock = active.data?.current?.card?.block || activeCardData.block;

    // Check if dropping onto another card (replacement logic)
    if (
      !String(overId).startsWith("block-") &&
      overId !== activeId &&
      destBlock === findCardBlock(overId)
    ) {
      const overCard = cards.find((c) => c.id === overId);
      if (overCard && overCard.block === destBlock) {
        // Check if same block — reorder
        if (sourceBlock === destBlock) {
          // Reorder within same block
          const blockCards = getBlockCards(destBlock);
          const oldIndex = blockCards.findIndex((c) => c.id === activeId);
          const newIndex = blockCards.findIndex((c) => c.id === overId);

          if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
            const reordered = arrayMove(blockCards, oldIndex, newIndex);
            const reorderData = reordered.map((c, i) => ({
              id: c.id,
              block: destBlock,
              position: i,
            }));

            // Optimistic update
            setCards((prev) => {
              const otherCards = prev.filter((c) => c.block !== destBlock);
              const updated = reordered.map((c, i) => ({
                ...c,
                position: i,
              }));
              return [...otherCards, ...updated];
            });

            try {
              await fetch("/api/cards/reorder", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ cards: reorderData }),
              });
            } catch (err) {
              console.error("Failed to reorder:", err);
              await fetchCards();
            }
            return;
          }
        } else {
          // Different blocks — open replace popup
          setReplacePopup({
            open: true,
            replacingCard: activeCardData,
            replacedCard: overCard,
          });
          // Revert optimistic move
          setCards((prev) =>
            prev.map((c) =>
              c.id === activeId ? { ...c, block: sourceBlock } : c
            )
          );
          return;
        }
      }
    }

    // Simple block move (not onto another card)
    if (sourceBlock !== destBlock) {
      // Move card to new block
      const destCards = cards.filter(
        (c) => c.block === destBlock && c.id !== activeId
      );
      const newPosition = destCards.length;

      try {
        // Record state history + update
        await fetch(`/api/cards/${activeId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            block: destBlock,
            position: newPosition,
          }),
        });
        await fetchCards();
      } catch (err) {
        console.error("Failed to move card:", err);
        await fetchCards();
      }
    }
  };

  if (loading) {
    return (
      <div className="app-layout">
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--text-muted)",
            fontSize: "16px",
          }}
        >
          Carregando...
        </div>
      </div>
    );
  }

  const inboxCards = getBlockCards("inbox");
  const activeCards = getBlockCards("active");
  const archiveCards = getBlockCards("archive");
  const deletedCards = cards
    .filter((c) => c.block === "deleted")
    .sort((a, b) => a.position - b.position);

  return (
    <div className="app-layout" id="app-layout">
      <TopMenu
        onOpenDeleted={() => setDeletedOpen(true)}
        onOpenProjects={() => setProjectsOpen(true)}
      />

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <main className="main-content">
          {/* Sidebar: Inbox + Archive */}
          <aside className="sidebar">
            <Block
              blockId="inbox"
              cards={inboxCards}
              onAddCard={handleAddCard}
              onDeleteCard={handleDeleteCard}
            />
            <Block
              blockId="archive"
              cards={archiveCards}
              onAddCard={handleAddCard}
              onDeleteCard={handleDeleteCard}
            />
          </aside>

          {/* Main area: Active */}
          <Block
            blockId="active"
            cards={activeCards}
            onAddCard={handleAddCard}
            onDeleteCard={handleDeleteCard}
          />
        </main>

        <DragOverlay>
          {activeCard ? <DragOverlayCard card={activeCard} /> : null}
        </DragOverlay>
      </DndContext>

      {/* Popups */}
      <AddCardPopup
        isOpen={addCardOpen}
        onClose={() => setAddCardOpen(false)}
        onSubmit={handleSubmitCard}
        defaultBlock={addCardBlock}
        projects={projects}
        onCreateProject={handleCreateProject}
      />

      <ReplacePopup
        isOpen={replacePopup.open}
        onClose={() =>
          setReplacePopup({ open: false, replacingCard: null, replacedCard: null })
        }
        onSubmit={handleReplaceSubmit}
        replacingCard={replacePopup.replacingCard}
        replacedCard={replacePopup.replacedCard}
      />

      <ConfirmReplacePopup
        isOpen={confirmReplace.open}
        onClose={() =>
          setConfirmReplace({
            open: false,
            replacingCard: null,
            replacedCard: null,
          })
        }
        onExtend={handleConfirmExtend}
        onReplace={handleConfirmReplace}
        onCancel={handleConfirmCancel}
        replacingCard={confirmReplace.replacingCard}
        replacedCard={confirmReplace.replacedCard}
      />

      <DeletedPopup
        isOpen={deletedOpen}
        onClose={() => setDeletedOpen(false)}
        cards={deletedCards}
        onRestore={handleRestoreCard}
      />

      <ProjectsPopup
        isOpen={projectsOpen}
        onClose={() => setProjectsOpen(false)}
        projects={projects}
        onToggleActive={handleToggleProjectActive}
        onCreateProject={handleCreateProject}
      />
    </div>
  );
}
