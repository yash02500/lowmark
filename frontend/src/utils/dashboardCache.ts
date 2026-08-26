export const clearDashboardAICache = () => {
    if (typeof window === "undefined") {
        return;
    }

    sessionStorage.removeItem("dashboardInsights");
    sessionStorage.removeItem("dashboardAttention");
    sessionStorage.removeItem("dashboardAI_cachedAt");
};