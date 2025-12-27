import { useState } from 'react';
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

    return (
        <div className="flex flex-col min-h-screen h-screen w-full">
            <Header onMenuClick={toggleSidebar} />
            <div className="relative flex-1 overflow-hidden">
                <Map onCountChange={setCount} />
                <SideBar
                    isOpen={isSidebarOpen}
                    onClose={toggleSidebar}
                    count={count}
                    selectedRatings={selectedRatings}
                    onRatingsChange={setSelectedRatings}
                />
            </div>
        </div>
    )
}