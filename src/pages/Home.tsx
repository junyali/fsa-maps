import { useState } from 'react';
import { Panel, Group, Separator } from 'react-resizable-panels';
import { Header } from '../components/Header';
import { Map } from '../components/Map';
import { SideBar } from "../components/SideBar";

export function HomePage() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
        return window.innerWidth >= 1024;
    });
    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const [count, setCount] = useState(0);
    const [selectedRatings, setSelectedRatings] = useState<string[]>([
        "2", "1", "0", "improvementrequired", "exempt", "awaitingpublication", "awaitinginspection"
    ])
    const [flyTo, setFlyTo] = useState<{ lat: number; lng: number } | null>(null);
    const [flyToBusinessId, setFlyToBusinessId] = useState<number | null>(null);

    const handleFlyToLocation = (lat: number, lng: number, businessId?: number | null | undefined) => {
        setFlyTo({ lat, lng });
        setFlyToBusinessId(businessId ?? null);
        setTimeout(() => {
            setFlyTo(null);
            setFlyToBusinessId(null);
        }, 100);
    }

    const isDesktop = window.innerWidth >= 1024;

    return (
        <div className="flex flex-col min-h-screen h-screen w-full">
            <Header onMenuClick={toggleSidebar} />
            {isDesktop ? (
                <Group orientation="horizontal" className="flex-1">
                    <Panel defaultSize={60} minSize={30}>
                        <Map
                            onCountChange={setCount}
                            selectedRatings={selectedRatings}
                            flyTo={flyTo}
                            flyToBusinessId={flyToBusinessId}
                        />
                    </Panel>
                    <Separator className="bg-gray-200 w-4" />
                    <Panel defaultSize={40} minSize={25}>
                        <SideBar
                            isOpen={true}
                            count={count}
                            selectedRatings={selectedRatings}
                            onRatingsChange={setSelectedRatings}
                            onFlyTo={handleFlyToLocation}
                        />
                    </Panel>
                </Group>
            ) : (
                <div className="relative flex-1 overflow-hidden">
                    <Map
                        onCountChange={setCount}
                        selectedRatings={selectedRatings}
                        flyTo={flyTo}
                        flyToBusinessId={flyToBusinessId}
                    />
                    <SideBar
                        isOpen={isSidebarOpen}
                        count={count}
                        selectedRatings={selectedRatings}
                        onRatingsChange={setSelectedRatings}
                        onFlyTo={handleFlyToLocation}
                    />
                </div>
            )}
        </div>
    )
}