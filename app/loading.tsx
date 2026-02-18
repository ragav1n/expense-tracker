import { WaveLoader } from "@/components/ui/wave-loader";

export default function Loading() {
    return (
        <div
            className="fixed inset-0 flex flex-col items-center justify-center bg-background/40 backdrop-blur-md z-[9999]"
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(12, 8, 30, 0.4)', // Semi-transparent theme color
                backdropFilter: 'blur(12px)',
                zIndex: 9999
            }}
        >
            <WaveLoader bars={5} message="Loading..." />
        </div>
    );
}
