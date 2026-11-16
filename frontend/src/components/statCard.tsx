import { ReactNode } from "react";

interface StatCardProps {
    title: string;
    value: string | number;
    description?: string;
    icon?: ReactNode;
    accent?: "emerald" | "blue" | "amber" | "rose";
}

const accentStyles = {
    emerald: {
        icon: "bg-emerald-50 text-emerald-600",
        glow: "group-hover:border-emerald-200",
    },
    blue: {
        icon: "bg-blue-50 text-blue-600",
        glow: "group-hover:border-blue-200",
    },
    amber: {
        icon: "bg-amber-50 text-amber-600",
        glow: "group-hover:border-amber-200",
    },
    rose: {
        icon: "bg-rose-50 text-rose-600",
        glow: "group-hover:border-rose-200",
    },
};

const StatCard = ({
    title,
    value,
    description,
    icon,
    accent = "emerald",
}: StatCardProps) => {
    const styles = accentStyles[accent];

    return (
        <div
            className={`group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-200/50 ${styles.glow}`}
        >
            {/* Decorative background */}
            <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-emerald-50/70 blur-2xl transition group-hover:bg-emerald-100/70" />

            <div className="relative">
                <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-medium text-slate-500">
                        {title}
                    </p>

                    {icon && (
                        <div
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${styles.icon}`}
                        >
                            {icon}
                        </div>
                    )}
                </div>

                <p className="mt-4 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                    {value}
                </p>

                {description && (
                    <p className="mt-2 text-xs leading-relaxed text-slate-400">
                        {description}
                    </p>
                )}
            </div>
        </div>
    );
};

export default StatCard;
