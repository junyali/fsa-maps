export function SideBar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void; }) {
    return (
        <div className="text-black">
            <button
                onClick={onClose}
                className={`hidden lg:block absolute top-1/2 ${isOpen ? 'right-2/5' : 'right-0'} -translate-y-1/2 bg-white rounded-l-md hover:bg-gray-100 p-3 text-xl font-bold transition-all duration-100`}
                style={{
                    zIndex: 1001
                }}
            >
                {isOpen ? ">" : "<"}
            </button>
            <div
                className={`absolute w-full lg:w-2/5 top-0 right-0 h-full bg-white transition-transform duration-100 ${isOpen ? 'translate-y-0 lg:translate-x-0' : 'translate-y-full lg:translate-x-full'}`}
                style={{
                    zIndex: 1000
                }}
            >
                <div className="p-4">

                </div>
            </div>
        </div>
    )
}