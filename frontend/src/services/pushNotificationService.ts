import api from "./api";

const registerServiceWorker = async () => {
    if (!("serviceWorker" in navigator)) {
        throw new Error(
            "Service workers are not supported by this browser"
        );
    }

    return await navigator.serviceWorker.register(
        "/sw.js"
    );
};

const subscribeToPush = async () => {
    if (!("Notification" in window)) {
        throw new Error(
            "Browser notifications are not supported"
        );
    }

    const permission = await Notification.requestPermission();

    if (permission !== "granted") {
        throw new Error(
            "Notification permission was not granted"
        );
    }

    await registerServiceWorker();

    const registration = await navigator.serviceWorker.ready;
    const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

    if (!publicKey) {
        throw new Error(
            "VAPID public key is not configured"
        );
    }

    const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: publicKey,
        });

    const subscriptionJson = subscription.toJSON();

    await api.post("/push-subscriptions",
        {
            endpoint:
                subscriptionJson.endpoint,

            keys: {
                p256dh:
                    subscriptionJson.keys?.p256dh,

                auth:
                    subscriptionJson.keys?.auth,
            },
        }
    );

    return subscription;
};

const getExistingSubscription = async () => {
    if (!("serviceWorker" in navigator)) {
        return null;
    }

    const registration =
        await navigator.serviceWorker.getRegistration(
            "/sw.js"
        );

    if (!registration) {
        return null;
    }

    return await registration.pushManager.getSubscription();
};

const unsubscribeFromPush = async () => {
    const registration = await navigator.serviceWorker.getRegistration(
            "/sw.js"
        );

    if (!registration) {
        return;
    }

    const subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
        return;
    }

    const endpoint = subscription.endpoint;

    await api.delete("/push-subscriptions",
        {
            data: {
                endpoint,
            },
        }
    );

    await subscription.unsubscribe();
};

export default {
    registerServiceWorker,
    subscribeToPush,
    unsubscribeFromPush,
    getExistingSubscription,
};