/**
 * @jest-environment node
 */

import { NextRequest } from "next/server";

const mockProjects = [
  {
    id: "proj-1",
    name: "Saúde",
    active: true,
    _count: { cards: 3 },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "proj-2",
    name: "Carreira",
    active: false,
    _count: { cards: 1 },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

jest.mock("@/lib/prisma", () => ({
  __esModule: true,
  default: {
    project: {
      findMany: jest.fn().mockResolvedValue(mockProjects),
      findUnique: jest.fn().mockImplementation(({ where }) => {
        const project = mockProjects.find((p) => p.id === where.id);
        return Promise.resolve(project || null);
      }),
      create: jest.fn().mockImplementation(({ data }) =>
        Promise.resolve({
          id: "proj-new",
          ...data,
          active: true,
          _count: { cards: 0 },
          createdAt: new Date(),
          updatedAt: new Date(),
        })
      ),
      update: jest.fn().mockImplementation(({ where, data }) => {
        const project = mockProjects.find((p) => p.id === where.id);
        return Promise.resolve({
          ...project,
          ...data,
          _count: { cards: 0 },
        });
      }),
      delete: jest.fn().mockResolvedValue({}),
    },
    card: {
      updateMany: jest.fn().mockResolvedValue({}),
    },
  },
}));

describe("Projects API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/projects", () => {
    it("should return all projects", async () => {
      const { GET } = require("@/app/api/projects/route");
      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(Array.isArray(data)).toBe(true);
      expect(data).toHaveLength(2);
    });
  });

  describe("POST /api/projects", () => {
    it("should create a new project", async () => {
      const { POST } = require("@/app/api/projects/route");

      const request = new NextRequest("http://localhost:3000/api/projects", {
        method: "POST",
        body: JSON.stringify({ name: "Novo Projeto" }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.name).toBe("Novo Projeto");
    });

    it("should reject project without name", async () => {
      const { POST } = require("@/app/api/projects/route");

      const request = new NextRequest("http://localhost:3000/api/projects", {
        method: "POST",
        body: JSON.stringify({ name: "" }),
      });

      const response = await POST(request);
      expect(response.status).toBe(400);
    });
  });

  describe("PATCH /api/projects/:id", () => {
    it("should toggle project active state", async () => {
      const { PATCH } = require("@/app/api/projects/[id]/route");

      const request = new NextRequest("http://localhost:3000/api/projects/proj-1", {
        method: "PATCH",
        body: JSON.stringify({ active: false }),
      });

      const response = await PATCH(request, {
        params: Promise.resolve({ id: "proj-1" }),
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.active).toBe(false);
    });
  });
});
