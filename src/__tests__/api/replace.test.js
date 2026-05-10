/**
 * @jest-environment node
 */

import { NextRequest } from "next/server";

const mockCardX = {
  id: "card-x",
  title: "Novo Hábito",
  block: "inbox",
  position: 0,
  replacesId: null,
  replacedById: null,
  countdownStart: null,
  countdownEnd: null,
};

const mockCardY = {
  id: "card-y",
  title: "Hábito Antigo",
  block: "active",
  position: 0,
  replacesId: null,
  replacedById: null,
  countdownStart: null,
  countdownEnd: null,
};

jest.mock("@/lib/prisma", () => ({
  __esModule: true,
  default: {
    card: {
      findUnique: jest.fn().mockImplementation(({ where }) => {
        if (where.id === "card-x") return Promise.resolve({ ...mockCardX });
        if (where.id === "card-y") return Promise.resolve({ ...mockCardY });
        return Promise.resolve(null);
      }),
      findMany: jest.fn().mockResolvedValue([
        {
          ...mockCardX,
          project: null,
          stateHistory: [],
        },
        {
          ...mockCardY,
          project: null,
          stateHistory: [{ fromBlock: "active", toBlock: "archive", date: new Date() }],
        },
      ]),
      update: jest.fn().mockImplementation(({ where, data }) =>
        Promise.resolve({ id: where.id, ...data })
      ),
    },
    stateHistory: {
      create: jest.fn().mockResolvedValue({}),
    },
    $transaction: jest.fn().mockImplementation((promises) => Promise.all(promises)),
  },
}));

describe("Replace API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /api/cards/replace", () => {
    it("should perform instant replacement", async () => {
      const { POST } = require("@/app/api/cards/replace/route");

      const request = new NextRequest("http://localhost:3000/api/cards/replace", {
        method: "POST",
        body: JSON.stringify({
          replacingCardId: "card-x",
          replacedCardId: "card-y",
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(Array.isArray(data)).toBe(true);
    });

    it("should perform scheduled replacement", async () => {
      const { POST } = require("@/app/api/cards/replace/route");

      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);

      const request = new NextRequest("http://localhost:3000/api/cards/replace", {
        method: "POST",
        body: JSON.stringify({
          replacingCardId: "card-x",
          replacedCardId: "card-y",
          startDate: futureDate.toISOString(),
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
    });

    it("should return 404 for non-existent cards", async () => {
      const { POST } = require("@/app/api/cards/replace/route");

      const request = new NextRequest("http://localhost:3000/api/cards/replace", {
        method: "POST",
        body: JSON.stringify({
          replacingCardId: "nonexistent",
          replacedCardId: "card-y",
        }),
      });

      const response = await POST(request);
      expect(response.status).toBe(404);
    });
  });
});
