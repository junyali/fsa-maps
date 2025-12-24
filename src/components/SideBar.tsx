import { useState } from 'react';

export function SideBar() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    return (
        <div
            className={`absolute w-2/5 top-0 right-0 h-full bg-white transition-transform duration-100 text-black ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}
            style={{
                zIndex: 1000
            }}
        >
            <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="absolute left-0 top-1/2 -translate-x-full -translate-y-1/2 bg-white rounded-l-md hover:bg-gray-100 p-3 text-xl font-bold"
            >
                {isSidebarOpen ? ">" : "<"}
            </button>
            <div className="p-4">
                <h1 className="text-xl font-bold mb-4">FSA Maps</h1>
            </div>
        </div>
    )
}