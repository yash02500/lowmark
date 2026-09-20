import { z } from "zod";

export const notificationIdParamSchema = z.object({
    id: z.coerce
        .number()
        .int("Notification ID must be an integer")
        .positive("Notification ID must be greater than 0"),
});

export type NotificationIdParam = z.infer<typeof notificationIdParamSchema>;