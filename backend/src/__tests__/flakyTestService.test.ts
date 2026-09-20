
import { FlakyTestService } from "../services/flakyTestService";

// Mock PostgreSQL
jest.mock("pg", () => {
  const mockQuery = jest.fn();

  return {
    Pool: jest.fn(() => ({
      query: mockQuery,
    })),
    __mockQuery: mockQuery,
  };
});

// Get the mocked query function
const { __mockQuery: mockQuery } = jest.requireMock("pg");

describe("FlakyTestService", () => {
  describe("isFlaky()", () => {
    beforeEach(() => {
      mockQuery.mockReset();
    });

    test("should return true when test has both PASS and FAIL statuses", async () => {
      mockQuery.mockResolvedValueOnce({
        rows: [
          {
            pass_count: "3",
            fail_count: "2",
          },
        ],
      });

      const result = await FlakyTestService.isFlaky(
        "login test",
        1
      );

      expect(result).toBe(true);
    });

    test("should return false when test has only PASS status", async () => {
      mockQuery.mockResolvedValueOnce({
        rows: [
          {
            pass_count: "5",
            fail_count: "0",
          },
        ],
      });

      const result = await FlakyTestService.isFlaky(
        "login test",
        1
      );

      expect(result).toBe(false);
    });

    test("should return false when test has only FAIL status", async () => {
      mockQuery.mockResolvedValueOnce({
        rows: [
          {
            pass_count: "0",
            fail_count: "5",
          },
        ],
      });

      const result = await FlakyTestService.isFlaky(
        "login test",
        1
      );

      expect(result).toBe(false);
    });
  });

  describe("calculateFlakiness()", () => {
    test("should return 40 when passCount=3, failCount=2, totalCount=5", () => {
      const result = FlakyTestService.calculateFlakiness(
        3,
        2,
        5
      );

      expect(result).toBe(40);
    });

    test("should return 0 when passCount=5, failCount=0, totalCount=5", () => {
      const result = FlakyTestService.calculateFlakiness(
        5,
        0,
        5
      );

      expect(result).toBe(0);
    });

    test("should return 100 when passCount=0, failCount=5, totalCount=5", () => {
      const result = FlakyTestService.calculateFlakiness(
        0,
        5,
        5
      );

      expect(result).toBe(100);
    });
  });
});
