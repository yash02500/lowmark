import { TrendingDown } from "lucide-react";

interface BrandLogoProps {
    iconSize?: string;
    textSize?: string;
}

const BrandLogo = ({
    iconSize = "h-14 w-14",
    textSize = "text-3xl",
}: BrandLogoProps) => {
    return (
        <div className="inline-flex items-center gap-3">
            <div
                className={`flex ${iconSize} shrink-0 items-center justify-center rounded-2xl bg-emerald-400`}
            >
                <TrendingDown
                    className="h-7 w-7 text-[#06251d]"
                    strokeWidth={2.8}
                />
            </div>

            <span
                className={`${textSize} font-bold tracking-tight text-white`}
            >
                LowMark
            </span>
        </div>
    );
};

export default BrandLogo;
