import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import aiProviderState from "./aiProviderState";
import aiProviderUsageRepository from "../repositories/aiProviderUsageRepository";
// Mock repository
jest.mock("../repositories/aiProviderUsageRepository", () => ({
    __esModule: true,
    default: {
        getUsage: jest.fn(),
        createUsage: jest.fn(),
        incrementRequestCount: jest.fn(),
        markUnavailable: jest.fn(),
    },
}));

// Helper to create mock Sequelize usage instance
const createMockUsage = (
    requestCount: number,
    unavailable = false
) => ({
    get: jest.fn((field: string) => {
        if (field === "requestCount") {
            return requestCount;
        }

        if (field === "unavailable") {
            return unavailable;
        }

        return null;
    }),
});

describe("aiProviderState", () => {
    beforeEach(() => {
        jest.mocked(aiProviderUsageRepository.getUsage).mockReset();
        jest.mocked(aiProviderUsageRepository.createUsage).mockReset();
        jest.mocked(aiProviderUsageRepository.incrementRequestCount).mockReset();
        jest.mocked(aiProviderUsageRepository.markUnavailable).mockReset();
    });

    // CAN USE OPENROUTER
    describe("canUseOpenRouter", () => {
        it("should return true when usage does not exist and create usage", async () => {
            const mockUsage = createMockUsage(0);

            jest.mocked(aiProviderUsageRepository.getUsage)
                .mockResolvedValue(null as never);

            jest.mocked(aiProviderUsageRepository.createUsage)
                .mockResolvedValue(mockUsage as never);

            const result =
                await aiProviderState.canUseOpenRouter();

            expect(result).toBe(true);

            expect(aiProviderUsageRepository.getUsage)
                .toHaveBeenCalledWith(
                    "openrouter",
                    expect.any(String)
                );

            expect(aiProviderUsageRepository.createUsage)
                .toHaveBeenCalledWith(
                    "openrouter",
                    expect.any(String)
                );
        });

        it("should return true when request count is below daily limit", async () => {
            const mockUsage = createMockUsage(49);

            jest.mocked(aiProviderUsageRepository.getUsage)
                .mockResolvedValue(mockUsage as never);

            const result =
                await aiProviderState.canUseOpenRouter();

            expect(result).toBe(true);

            expect(aiProviderUsageRepository.markUnavailable)
                .not.toHaveBeenCalled();
        });

        it("should return false when request count reaches daily limit", async () => {
            const mockUsage = createMockUsage(50);

            jest.mocked(aiProviderUsageRepository.getUsage)
                .mockResolvedValue(mockUsage as never);

            const result =
                await aiProviderState.canUseOpenRouter();

            expect(result).toBe(false);

            expect(aiProviderUsageRepository.markUnavailable)
                .toHaveBeenCalledWith(
                    "openrouter",
                    expect.any(String)
                );
        });

        it("should return false when request count exceeds daily limit", async () => {
            const mockUsage = createMockUsage(55);

            jest.mocked(aiProviderUsageRepository.getUsage)
                .mockResolvedValue(mockUsage as never);

            const result =
                await aiProviderState.canUseOpenRouter();

            expect(result).toBe(false);

            expect(aiProviderUsageRepository.markUnavailable)
                .toHaveBeenCalledTimes(1);
        });

        it("should return false when OpenRouter is already unavailable", async () => {
            const mockUsage = createMockUsage(20, true);

            jest.mocked(aiProviderUsageRepository.getUsage)
                .mockResolvedValue(mockUsage as never);

            const result =
                await aiProviderState.canUseOpenRouter();

            expect(result).toBe(false);

            expect(aiProviderUsageRepository.markUnavailable)
                .not.toHaveBeenCalled();
        });

        it("should create usage when no usage record exists", async () => {
            const mockUsage = createMockUsage(10);

            jest.mocked(aiProviderUsageRepository.getUsage)
                .mockResolvedValue(null as never);

            jest.mocked(aiProviderUsageRepository.createUsage)
                .mockResolvedValue(mockUsage as never);

            const result =
                await aiProviderState.canUseOpenRouter();

            expect(result).toBe(true);

            expect(aiProviderUsageRepository.createUsage)
                .toHaveBeenCalledTimes(1);
        });
    });

    // RECORD OPENROUTER REQUEST
    describe("recordOpenRouterRequest", () => {
        it("should increment request count and return updated count", async () => {
            const mockUsage = createMockUsage(10);

            jest.mocked(aiProviderUsageRepository.incrementRequestCount)
                .mockResolvedValue(mockUsage as never);

            const result =
                await aiProviderState.recordOpenRouterRequest();

            expect(result).toBe(10);

            expect(aiProviderUsageRepository.incrementRequestCount)
                .toHaveBeenCalledWith(
                    "openrouter",
                    expect.any(String)
                );
        });

        it("should mark OpenRouter unavailable when request count reaches daily limit", async () => {
            const mockUsage = createMockUsage(50);

            jest.mocked(aiProviderUsageRepository.incrementRequestCount)
                .mockResolvedValue(mockUsage as never);

            const result =
                await aiProviderState.recordOpenRouterRequest();

            expect(result).toBe(50);

            expect(aiProviderUsageRepository.markUnavailable)
                .toHaveBeenCalledWith(
                    "openrouter",
                    expect.any(String)
                );
        });

        it("should mark OpenRouter unavailable when request count exceeds daily limit", async () => {
            const mockUsage = createMockUsage(51);

            jest.mocked(aiProviderUsageRepository.incrementRequestCount)
                .mockResolvedValue(mockUsage as never);

            const result =
                await aiProviderState.recordOpenRouterRequest();

            expect(result).toBe(51);

            expect(aiProviderUsageRepository.markUnavailable)
                .toHaveBeenCalledTimes(1);
        });

        it("should not mark OpenRouter unavailable when request count is below daily limit", async () => {
            const mockUsage = createMockUsage(49);

            jest.mocked(aiProviderUsageRepository.incrementRequestCount)
                .mockResolvedValue(mockUsage as never);

            const result =
                await aiProviderState.recordOpenRouterRequest();

            expect(result).toBe(49);

            expect(aiProviderUsageRepository.markUnavailable)
                .not.toHaveBeenCalled();
        });
    });

    // MARK OPENROUTER UNAVAILABLE
    describe("markOpenRouterUnavailable", () => {
        it("should mark OpenRouter unavailable for current date", async () => {
            jest.mocked(aiProviderUsageRepository.markUnavailable)
                .mockResolvedValue(undefined as never);

            await aiProviderState.markOpenRouterUnavailable();

            expect(aiProviderUsageRepository.markUnavailable)
                .toHaveBeenCalledWith(
                    "openrouter",
                    expect.any(String)
                );

            expect(aiProviderUsageRepository.markUnavailable)
                .toHaveBeenCalledTimes(1);
        });
    });

    // GET OPENROUTER STATE
    describe("getOpenRouterState", () => {
        it("should return default state when usage does not exist", async () => {
            jest.mocked(aiProviderUsageRepository.getUsage)
                .mockResolvedValue(null as never);

            const result =
                await aiProviderState.getOpenRouterState();

            expect(result).toEqual({
                requestCount: 0,
                dailyLimit: 50,
                unavailable: false,
            });
        });

        it("should return current usage state", async () => {
            const mockUsage = createMockUsage(25, false);

            jest.mocked(aiProviderUsageRepository.getUsage)
                .mockResolvedValue(mockUsage as never);

            const result =
                await aiProviderState.getOpenRouterState();

            expect(result).toEqual({
                requestCount: 25,
                dailyLimit: 50,
                unavailable: false,
            });
        });

        it("should return unavailable true when provider is unavailable", async () => {
            const mockUsage = createMockUsage(50, true);

            jest.mocked(aiProviderUsageRepository.getUsage)
                .mockResolvedValue(mockUsage as never);

            const result =
                await aiProviderState.getOpenRouterState();

            expect(result).toEqual({
                requestCount: 50,
                dailyLimit: 50,
                unavailable: true,
            });
        });

        it("should convert string request count into number", async () => {
            const mockUsage = createMockUsage("35" as never, false);

            jest.mocked(aiProviderUsageRepository.getUsage)
                .mockResolvedValue(mockUsage as never);

            const result =
                await aiProviderState.getOpenRouterState();

            expect(result.requestCount).toBe(35);
            expect(typeof result.requestCount).toBe("number");
        });
    });
});
