import { CircleDollarSignIcon } from "lucide-react";

export function CardSpotlightFeaturesComp() {
    return (
        <div className="h-40 border hover:bg-green-950/50 border-green-950 p-5 rounded-lg">
            <div className="flex space-x-3 items-start">
                <CircleDollarSignIcon className="fill-green-400 stroke-green-900 p-1 size-8 bg-green-200 rounded-full" />
                <p className="text-green-700">Total Revenue</p>
            </div>
            <p className="text-3xl font-bold">$125,000</p>
        </div>
    );
}