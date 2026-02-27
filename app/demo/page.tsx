import { NeuralOrbDemo } from "@/components/neural-orb-demo"

export default function DemoPage() {
    return (
        <main className="min-h-screen bg-black flex items-center justify-center p-8">
            <div className="w-full max-w-3xl space-y-6">
                <h1 className="text-white text-2xl font-bold text-center">
                    Neural Orb Demo — 3 Edges
                </h1>
                <p className="text-white/50 text-center text-sm">
                    Glowing orbs travel along edges with trailing energy glow
                </p>
                <NeuralOrbDemo />
            </div>
        </main>
    )
}
