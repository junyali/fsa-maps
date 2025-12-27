export function Header({ onMenuClick }: { onMenuClick?: () => void;}) {
    return (
        <header className="flex px-4 py-3 gap-4 w-full text-black bg-white border-b- border-gray-200">
            <button
                onClick={onMenuClick}
                className="border-2 border-black lg:hidden px-2 hover:bg-gray-100 rounded-md transition-colors"
                aria-label="Options"
            >
                Info
            </button>
            <h1 className="text-xl font-semibold">
                FSA Maps
            </h1>
        </header>
    )
}
