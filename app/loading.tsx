import { WaveLoader } from "@/components/ui/wave-loader";

export default function Loading() {
    return (
        <div className="h-screen w-full flex flex-col items-center justify-center bg-background z-50">
            <WaveLoader bars={5} message="Loading..." />
        </div>
    );
}
