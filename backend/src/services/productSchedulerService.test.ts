import { describe, it, expect, beforeEach, afterEach, jest } from "@jest/globals";
import productRepository from "../repositories/productRepository";
import priceCheckQueue from "../queues/priceCheckQueue";
import productSchedulerService from "./productSchedulerService";

jest.mock("../repositories/productRepository", () => ({
    __esModule: true,
    default: {
        findProductsDueForCheck: jest.fn(),
    },
}));

jest.mock("../queues/priceCheckQueue", () => ({
    __esModule: true,
    default: {
        getJob: jest.fn(),
        add: jest.fn(),
    },
}));

const productRepo = productRepository as any;
const queue = priceCheckQueue as any;

const makeProduct = (id: number, priority?: number) => {
    const values: Record<string, number | undefined> = {
        id,
        priority,
    };

    return {
        getDataValue: (key: string) => values[key],
    };
};

beforeEach(() => {
    jest.resetAllMocks();

    productRepo.findProductsDueForCheck.mockResolvedValue([]);
    queue.getJob.mockResolvedValue(null);
    queue.add.mockResolvedValue(undefined);

    jest.spyOn(console, "log").mockImplementation(() => { });
    jest.spyOn(console, "error").mockImplementation(() => { });
});

afterEach(() => {
    jest.restoreAllMocks();
});

describe("productSchedulerService.processDueProducts", () => {
    it("should do nothing when no products are due", async () => {
        await productSchedulerService.processDueProducts();

        expect(
            productRepo.findProductsDueForCheck
        ).toHaveBeenCalledTimes(1);

        expect(queue.getJob).not.toHaveBeenCalled();
        expect(queue.add).not.toHaveBeenCalled();
    });

    it("should queue a price check for a product that has no existing job", async () => {
        productRepo.findProductsDueForCheck.mockResolvedValue([
            makeProduct(12, 3),
        ]);

        queue.getJob.mockResolvedValue(null);

        await productSchedulerService.processDueProducts();

        expect(queue.getJob).toHaveBeenCalledWith("product-12");

        expect(queue.add).toHaveBeenCalledWith(
            "check-product",
            { productId: 12 },
            {
                jobId: "product-12",
                priority: 3,
            }
        );
    });

    it("should use priority 10 when the product has no priority", async () => {
        productRepo.findProductsDueForCheck.mockResolvedValue([
            makeProduct(12),
        ]);

        await productSchedulerService.processDueProducts();

        expect(queue.add).toHaveBeenCalledWith(
            "check-product",
            { productId: 12 },
            {
                jobId: "product-12",
                priority: 10,
            }
        );
    });

    it("should use priority 10 when the product priority is zero", async () => {
        productRepo.findProductsDueForCheck.mockResolvedValue([
            makeProduct(12, 0),
        ]);

        await productSchedulerService.processDueProducts();

        expect(queue.add).toHaveBeenCalledWith(
            "check-product",
            { productId: 12 },
            {
                jobId: "product-12",
                priority: 10,
            }
        );
    });

    it("should skip products that already have waiting, active, or delayed jobs", async () => {
        const states = ["waiting", "active", "delayed"];

        productRepo.findProductsDueForCheck.mockResolvedValue(
            states.map((_, index) => makeProduct(index + 1, 5))
        );

        queue.getJob.mockImplementation(async (jobId: string) => {
            const productId = Number(
                jobId.replace("product-", "")
            );

            const state = states[productId - 1];

            return {
                getState: async () => state,
            };
        });

        await productSchedulerService.processDueProducts();

        expect(queue.getJob).toHaveBeenCalledTimes(3);
        expect(queue.add).not.toHaveBeenCalled();
    });

    it("should queue another check when the existing job is completed", async () => {
        productRepo.findProductsDueForCheck.mockResolvedValue([
            makeProduct(15, 2),
        ]);

        queue.getJob.mockResolvedValue({
            getState: async () => "completed",
        });

        await productSchedulerService.processDueProducts();

        expect(queue.add).toHaveBeenCalledWith(
            "check-product",
            { productId: 15 },
            {
                jobId: "product-15",
                priority: 2,
            }
        );
    });

    it("should continue processing other products if checking an existing job fails", async () => {
        productRepo.findProductsDueForCheck.mockResolvedValue([
            makeProduct(1, 1),
            makeProduct(2, 2),
        ]);

        queue.getJob.mockImplementationOnce(() =>
            Promise.reject(new Error("Redis unavailable"))
        );

        queue.getJob.mockResolvedValue(null);

        await productSchedulerService.processDueProducts();

        expect(queue.add).toHaveBeenCalledTimes(1);

        expect(queue.add).toHaveBeenCalledWith(
            "check-product",
            { productId: 2 },
            {
                jobId: "product-2",
                priority: 2,
            }
        );

        expect(console.error).toHaveBeenCalled();
    });

    it("should continue processing other products if adding a job fails", async () => {
        productRepo.findProductsDueForCheck.mockResolvedValue([
            makeProduct(1, 1),
            makeProduct(2, 2),
        ]);

        queue.add.mockImplementationOnce(() =>
            Promise.reject(new Error("Queue insertion failed"))
        );

        await productSchedulerService.processDueProducts();

        expect(queue.add).toHaveBeenCalledTimes(2);

        expect(queue.add).toHaveBeenNthCalledWith(
            2,
            "check-product",
            { productId: 2 },
            {
                jobId: "product-2",
                priority: 2,
            }
        );

        expect(console.error).toHaveBeenCalled();
    });

    it("should propagate an error if fetching due products fails", async () => {
        productRepo.findProductsDueForCheck.mockImplementationOnce(
            () => Promise.reject(new Error("Database unavailable"))
        );

        await expect(
            productSchedulerService.processDueProducts()
        ).rejects.toThrow("Database unavailable");

        expect(queue.add).not.toHaveBeenCalled();
    });
});
