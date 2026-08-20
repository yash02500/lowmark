export type NotificationType =
    | "target_price_reached"
    | "price_drop"
    | "back_in_stock"
    | "out_of_stock"
    | "discontinued";

export interface Notification {
    id: number;
    userId: number;
    productId: number;
    type: NotificationType;
    title: string;
    message: string;
    isRead: boolean;
    createdAt: string;
    updatedAt: string;
}