self.addEventListener("push", (event) => {
    if (!event.data) {
        return;
    }

    const data = event.data.json();
    const title = data.title || "Lowmark";

    const options = {
        body: data.message || "You have a new notification.",
        icon: "/icon-192.png",
        badge: "/icon-192.png",
        data: {
            url: data.url || "/notifications",
        },
    };

    event.waitUntil(
        self.registration.showNotification(
            title,
            options
        )
    );
});

self.addEventListener("notificationclick", (event) => {
    event.notification.close();

    const url =
        event.notification.data?.url ||
        "/notifications";

    event.waitUntil(
        clients.matchAll({
            type: "window",
            includeUncontrolled: true,
        }).then((clientList) => {
            for (const client of clientList) {
                if ("focus" in client) {
                    client.navigate(url);
                    return client.focus();
                }
            }

            if (clients.openWindow) {
                return clients.openWindow(url);
            }
        })
    );
});