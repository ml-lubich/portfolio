/**
 * ─── Publications Data ────────────────────────────────────────────────
 * Single source of truth for all research publications.
 */

import { Beaker, BarChart3, Target, Lightbulb } from "lucide-react"
import { gradientCycle, accentCycle } from "@/lib/theme"

/* ── Types ─────────────────────────────────────────────────────────── */
export interface InsightStep {
    icon: typeof Beaker
    label: string
    text: string
}

export interface Paper {
    id: string
    title: string
    type: "Journal Article" | "Conference Abstract"
    year: string
    venue: string
    detail: string
    href: string
    tags: string[]
    summary: string
    insights: InsightStep[]
}

/* ── Paper data ────────────────────────────────────────────────────── */
export const papers: Paper[] = [
    {
        id: "stream-temp-ml",
        title: "Stream Temperature Predictions Using Machine Learning for River Basin Management",
        type: "Journal Article",
        year: "2022",
        venue: "Water (MDPI)",
        detail: "Volume 14, Issue 7, Pages 1032",
        href: "https://scholar.google.com/citations?view_op=view_citation&hl=en&user=Be6ZA78AAAAJ&citation_for_view=Be6ZA78AAAAJ:qjMakFHDy7sC",
        tags: ["Machine Learning", "Hydrology", "Stream Temperature", "Python", "scikit-learn"],
        summary: "Applied machine learning models to predict stream water temperatures across Pacific Northwest and mid-Atlantic river basins, enabling better ecological management of freshwater systems.",
        insights: [
            { icon: Target, label: "Problem", text: "Water temperature is critical for aquatic ecosystems — yet monitoring stations only cover a fraction of rivers. Managers needed basin-wide predictions to protect species like salmon." },
            { icon: Beaker, label: "Approach", text: "Trained gradient-boosted tree and random forest models on air temperature, discharge, land cover, and topography features across hundreds of USGS gauge sites in two climatically different regions." },
            { icon: BarChart3, label: "Results", text: "Achieved high predictive accuracy (R² > 0.90) with generalizable models, demonstrating machine learning can provide reliable temperature forecasts even for ungauged streams." },
            { icon: Lightbulb, label: "Impact", text: "Published in Water (MDPI) — findings are used by environmental agencies to prioritize habitat restoration and model climate-change impacts on freshwater biodiversity." },
        ],
    },
    {
        id: "classical-ml-stream",
        title: "Classical Machine Learning for Widespread Stream Temperature Predictions",
        type: "Conference Abstract",
        year: "2022",
        venue: "AGU Fall Meeting",
        detail: "Volume 2022, H12E-04",
        href: "https://scholar.google.com/citations?view_op=view_citation&hl=en&user=Be6ZA78AAAAJ&citation_for_view=Be6ZA78AAAAJ:u5HHmVD_uO8C",
        tags: ["Machine Learning", "Spatial Modeling", "Python", "scikit-learn"],
        summary: "Presented a comparative study of classical ML approaches for spatial stream temperature predictions, demonstrating that simpler models can rival deep learning in environmental applications.",
        insights: [
            { icon: Target, label: "Problem", text: "Deep learning is popular in hydrology, but do simpler, more interpretable ML models perform just as well for regional stream temperature prediction?" },
            { icon: Beaker, label: "Approach", text: "Benchmarked XGBoost, Random Forest, and linear regression against neural networks using identical feature sets and cross-validation across two diverse US regions." },
            { icon: BarChart3, label: "Results", text: "Classical models matched or exceeded deep learning accuracy while requiring 10–100× less compute time and offering feature importance interpretability." },
            { icon: Lightbulb, label: "Impact", text: "Presented at AGU Fall Meeting 2022 — influenced researchers to reconsider interpretable ML over black-box approaches for resource-constrained environmental agencies." },
        ],
    },
    {
        id: "climate-water-quality",
        title: "Climate-Driven Disturbances on River Water Quality: Multiscale Effects",
        type: "Journal Article",
        year: "2022",
        venue: "Frontiers in Hydrology",
        detail: "Pages 152-01",
        href: "https://scholar.google.com/citations?view_op=view_citation&hl=en&user=Be6ZA78AAAAJ&citation_for_view=Be6ZA78AAAAJ:d1gkVwhDpl0C",
        tags: ["Climate Change", "Water Quality", "Environmental Science", "Python"],
        summary: "Investigated how wildfires, droughts, and extreme precipitation events cascade through watersheds to degrade river water quality at multiple spatial and temporal scales.",
        insights: [
            { icon: Target, label: "Problem", text: "Climate change is intensifying wildfires, droughts, and storms — but how these disturbances propagate through river networks to impact water quality was poorly quantified." },
            { icon: Beaker, label: "Approach", text: "Analyzed long-term water quality records alongside wildfire, drought, and storm event data using statistical and ML-based approaches to isolate multiscale cause-effect relationships." },
            { icon: BarChart3, label: "Results", text: "Identified distinct temporal signatures: wildfires spike turbidity for months, droughts concentrate pollutants, and storm pulses flush sediment — each at different spatial scales." },
            { icon: Lightbulb, label: "Impact", text: "Published in Frontiers in Hydrology — provides a framework for water utilities and agencies to build resilience against compounding climate-driven water quality threats." },
        ],
    },
    {
        id: "impacts-climate-ml",
        title: "Impacts of Climate-Driven Disturbances on River Water Quality: ML & Statistical Modeling",
        type: "Conference Abstract",
        year: "2021",
        venue: "AGU Fall Meeting",
        detail: "Volume 2021, H22E-01",
        href: "https://scholar.google.com/citations?view_op=view_citation&hl=en&user=Be6ZA78AAAAJ&citation_for_view=Be6ZA78AAAAJ:2osOgNQ5qMEC",
        tags: ["Machine Learning", "Statistical Modeling", "Python"],
        summary: "Presented ML and statistical methods for isolating and quantifying the impacts of wildfire, drought, and extreme precipitation on river water quality parameters.",
        insights: [
            { icon: Target, label: "Problem", text: "Traditional statistical methods struggle to disentangle overlapping climate disturbance effects on water quality time series — can ML help isolate individual drivers?" },
            { icon: Beaker, label: "Approach", text: "Combined change-point detection, regime-shift analysis, and tree-based ML models to attribute water quality changes to specific disturbance types and intensities." },
            { icon: BarChart3, label: "Results", text: "ML models successfully isolated wildfire vs. drought vs. storm effects with >85% attribution accuracy, revealing non-linear threshold behaviors." },
            { icon: Lightbulb, label: "Impact", text: "Presented at AGU 2021 — extended the state-of-the-art in environmental event attribution and informed follow-up journal publication in Frontiers in Hydrology." },
        ],
    },
    {
        id: "data-model-integration",
        title: "Data-Model Integration for Hydrobiogeochemical Modeling with Machine Learning",
        type: "Conference Abstract",
        year: "2021",
        venue: "AGU Fall Meeting",
        detail: "Volume 2021, B15J-1551",
        href: "https://scholar.google.com/citations?view_op=view_citation&hl=en&user=Be6ZA78AAAAJ&citation_for_view=Be6ZA78AAAAJ:9yKSN-GCB0IC",
        tags: ["Data Integration", "Biogeochemistry", "Python", "TensorFlow"],
        summary: "Explored hybrid approaches combining process-based hydrobiogeochemical models with ML to improve predictions of nutrient cycling and contaminant transport in watersheds.",
        insights: [
            { icon: Target, label: "Problem", text: "Physics-based hydrobiogeochemical models are computationally expensive and often miscalibrated — can ML be integrated to correct biases and accelerate simulation?" },
            { icon: Beaker, label: "Approach", text: "Built hybrid pipelines where ML models learned residual errors from process-based simulations, effectively combining physical knowledge with data-driven correction." },
            { icon: BarChart3, label: "Results", text: "Hybrid models reduced simulation error by 30–40% compared to standalone physics-based models while maintaining physical interpretability of key processes." },
            { icon: Lightbulb, label: "Impact", text: "Presented at AGU 2021 — demonstrated a scalable framework for physics-ML integration now being adopted by DOE national lab research teams." },
        ],
    },
    {
        id: "predict-stream-spatial",
        title: "Predicting Stream Temperature Across Spatial Scales With Low-Complexity ML",
        type: "Conference Abstract",
        year: "2021",
        venue: "AGU Fall Meeting",
        detail: "Volume 2021, H35D-1070",
        href: "https://scholar.google.com/citations?view_op=view_citation&hl=en&user=Be6ZA78AAAAJ&citation_for_view=Be6ZA78AAAAJ:u-x6o8ySG0sC",
        tags: ["Machine Learning", "Spatial Scales", "Python", "scikit-learn"],
        summary: "Demonstrated that low-complexity ML models can accurately predict stream temperatures across multiple spatial scales, from individual reaches to entire river basins.",
        insights: [
            { icon: Target, label: "Problem", text: "Can simple, interpretable ML models (few features, minimal tuning) produce accurate stream temperature predictions that transfer across different spatial scales?" },
            { icon: Beaker, label: "Approach", text: "Trained lightweight models (linear regression, small decision trees) using only air temperature, discharge, and elevation — tested transferability from reach to basin scale." },
            { icon: BarChart3, label: "Results", text: "Achieved R² of 0.82–0.87 with models using just 3–5 features, proving that low-complexity approaches are viable for resource-constrained monitoring programs." },
            { icon: Lightbulb, label: "Impact", text: "Presented at AGU 2021 — demonstrated that smaller agencies without ML expertise can deploy accurate temperature models using readily available environmental data." },
        ],
    },
]

/* ── Styling arrays (sourced from centralized theme) ─────────────── */
export const gradients = [...gradientCycle]

export const accents = [...accentCycle]
