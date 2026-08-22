interface StatCardProps {
    title: string;
    value: string | number;
    description?: string;
}

const StatCard = ({
    title,
    value,
    description,
}: StatCardProps) => {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <p className="text-sm font-medium text-slate-500">
                {title}
            </p>

            <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                {value}
            </p>

            {description && (
                <p className="mt-1 text-sm text-slate-500">
                    {description}
                </p>
            )}
        </div>
    );
};

export default StatCard;