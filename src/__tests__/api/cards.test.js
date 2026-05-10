/**
 * @jest-environment node
 */

import { NextRequest } from "next/server";

// Mock prisma
const mockCards = [
  {
    id: "card-1",
    title: "Exercício",
    why: "Saúde",
    block: "active",
    position: 0,
    projectId: null,
    project: null,
    stateHistory: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "card-2",
    title: "Leitura",
    why: "Conhecimento",
    block: "inbox",
    position: 0,
    projectId: null,
    project: null,
    stateHistory: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

jest.mock("@/lib/prisma", () => ({
  __esModule: true,
  default: {
    card: {
      findMany: jest.fn().mockResolvedValue(mockCards),
      findUnique: jest.fn().mockImplementation(({ where }) => {
        const card = mockCards.find((c) => c.id === where.id);
        return Promise.resolve(card || null);
      }),
      create: jest.fn().mockImplementation(({ data }) =>
        Promise.resolve({
          id: "card-new",
          ...data,
          project: null,
          stateHistory: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        })
      ),
      update: jest.fn().mockImplementation(({ where, data }) => {
        const card = mockCards.find((c) => c.id === where.id);
        return Promise.resolve({
          ...card,
          ...data,
          project: null,
          stateHistory: [],
        });
      }),
      aggregate: jest.fn().mockResolvedValue({ _max: { position: 0 } }),
    },
    stateHistory: {
      create: jest.fn().mockResolvedValue({}),
    },
  },
}));

describe("Cards API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/cards", () => {
    it("should return all cards", async () => {
      const { GET } = require("@/app/api/cards/route");
      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(Array.isArray(data)).toBe(true);
      expect(data).toHaveLength(2);
    });
  });

  describe("POST /api/cards", () => {
    it("should create a new card", async () => {
      const { POST } = require("@/app/api/cards/route");

      const request = new NextRequest("http://localhost:3000/api/cards", {
        method: "POST",
        body: JSON.stringify({
          title: "Meditação",
          why: "Foco mental",
          block: "inbox",
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.title).toBe("Meditação");
    });

    it("should reject card without title", async () => {
      const { POST } = require("@/app/api/cards/route");

      const request = new NextRequest("http://localhost:3000/api/cards", {
        method: "POST",
        body: JSON.stringify({
          title: "",
          block: "inbox",
        }),
      });

      const response = await POST(request);
      expect(response.status).toBe(400);
    });
  });

  describe("PATCH /api/cards/:id", () => {
    it("should update a card", async () => {
      const { PATCH } = require("@/app/api/cards/[id]/route");

      const request = new NextRequest("http://localhost:3000/api/cards/card-1", {
        method: "PATCH",
        body: JSON.stringify({ title: "Exercício atualizado" }),
      });

      const response = await PATCH(request, { params: Promise.resolve({ id: "card-1" }) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.title).toBe("Exercício atualizado");
    });

    it("should return 404 for non-existent card", async () => {
      const { PATCH } = require("@/app/api/cards/[id]/route");

      const request = new NextRequest("http://localhost:3000/api/cards/nonexistent", {
        method: "PATCH",
        body: JSON.stringify({ title: "test" }),
      });

      const response = await PATCH(request, {
        params: Promise.resolve({ id: "nonexistent" }),
      });
      expect(response.status).toBe(404);
    });
  });

  describe("DELETE /api/cards/:id", () => {
    it("should soft delete a card", async () => {
      const { DELETE } = require("@/app/api/cards/[id]/route");

      const request = new NextRequest("http://localhost:3000/api/cards/card-1", {
        method: "DELETE",
      });

      const response = await DELETE(request, {
        params: Promise.resolve({ id: "card-1" }),
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.block).toBe("deleted");
    });
  });
});
