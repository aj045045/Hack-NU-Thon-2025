'use client'
import { useSetAdminText } from "../layout";
import { AreaChartComp } from "./are-chart";
import { CardSpotlightFeaturesComp } from "./feature-card";

export default function AdminPage() {
    useSetAdminText("Dashboard");
    return (
        <>
            <div className="grid grid-cols-3 gap-4 w-full mb-10">
                <CardSpotlightFeaturesComp />
                <CardSpotlightFeaturesComp />
                <CardSpotlightFeaturesComp />
                <CardSpotlightFeaturesComp />
            </div>
            <AreaChartComp />
            <AreaChartComp />
        </>
    );
}
