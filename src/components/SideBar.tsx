import { useEffect, useState } from 'react';
import { fetchMetadata, type Metadata } from '../api/metadata';
import {getRatingStyle} from "../utils/ratings.tsx";

const allRatings = ["5", "4", "3", "2", "1", "0", "passandeatsafe", "pass", "improvementrequired", "exempt", "awaitingpublication", "awaitinginspection"];
const fhrsRatings = ["5", "4", "3", "2", "1", "0"];
const fhisRatings = ["passandeatsafe", "pass", "improvementrequired"];
const otherRatings = ["exempt", "awaitingpublication", "awaitinginspection"];

export function SideBar({
    isOpen,
    onClose,
    count,
    selectedRatings,
    onRatingsChange
}: {
    isOpen: boolean;
    onClose: () => void;
    count: number;
    selectedRatings: string[];
    onRatingsChange: (ratings: string[]) => void;
}) {
    const [metadata, setMetadata] = useState<Metadata | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchMetadata()
            .then(data => setMetadata(data))
            .catch((err: Error) => setError(err.message));
    }, []);

    const formatDate = (isoString: string) => {
        const date = new Date(isoString);
        const day = date.getUTCDate().toString().padStart(2, '0');
        const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
        const year = date.getUTCFullYear();
        const hours = date.getUTCHours().toString().padStart(2, '0');
        const minutes = date.getUTCMinutes().toString().padStart(2, '0');
        const seconds = date.getUTCSeconds().toString().padStart(2, '0');

        return `${day}/${month}/${year} ${hours}:${minutes}:${seconds} UTC`
    }

    const toggleRating = (rating: string) => {
        if (selectedRatings.includes(rating)) {
            onRatingsChange(selectedRatings.filter(r => r !== rating));
        } else {
            onRatingsChange([...selectedRatings, rating]);
        }
    }

    const selectAll = () => {
        onRatingsChange(allRatings);
    }

    const deselectAll = () => {
        onRatingsChange([]);
    }

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
                className={`absolute w-full lg:w-2/5 top-0 right-0 h-full bg-white overflow-y-auto transition-transform duration-100 ${isOpen ? 'translate-y-0 lg:translate-x-0' : 'translate-y-full lg:translate-x-full'}`}
                style={{
                    zIndex: 1000
                }}
            >
                <div className="px-4 space-y-1">
                    <div className="mx-1 space-x-2">
                        <a
                            href="https://github.com/junyali/fsa-maps"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="decoration underline text-gray-500 text-xs"
                        >
                            View source code (GitHub)
                        </a>
                        <a
                            href="https://ratings.food.gov.uk/open-data"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="decoration underline text-gray-500 text-xs"
                        >
                            View source data (Food Standards Agency UK)
                        </a>
                    </div>
                    <div className="bg-gray-100 border-2 border-gray-200 p-2 text-xl whitespace-nowrap">
                        <h2>
                            Last Updated:{' '}
                            {error ? (
                                <span className="text-red-500 text-sm">Error loading</span>
                            ) : metadata ? (
                                <>
                                    <span className="font-bold">
                                        {formatDate(metadata.download_date)}
                                    </span>
                                    {metadata.data_age > 30 && (
                                        <span className="text-red-400 text-sm ml-2">
                                            ({metadata.data_age} days old)
                                        </span>
                                    )}
                                </>
                            ) : (
                                <span className="text-sm">Loading...</span>
                            )}
                        </h2>
                        <h2>
                            Displaying:{' '}
                            <span className="font-bold">
                                {count.toLocaleString()}
                            </span>
                            {' '}{count === 1 ? 'business' : 'businesses'}{' '}{metadata && (
                                <span className="text-gray-500 text-base">
                                    out of {metadata.imported_records.toLocaleString()} records
                                </span>
                            )}
                        </h2>
                    </div>
                    <div className="text-lg whitespace-normal">
                        <p>
                            This unofficial map is for informational purposes only, and is not affiliated with or endorsed by the Food Standards Agency or Food Standards Scotland. Data may be inaccurate and/or incomplete. Due to missing or incorrect location data, some businesses may not appear on the map or may be displayed in the wrong location.
                        </p>
                    </div>
                    <div className="w-full h-0.5 bg-gray-100" />
                    <div className="bg-gray-100 border-2 border-gray-200 p-2 space-y-3">
                        <div className="flex justify-between items-center">
                            <h3 className="font-bold text-lg">Filters</h3>
                            <div className="space-x-2">
                                <button
                                    onClick={selectAll}
                                    className="text-sm text-blue-600 hover:underline cursor-pointer"
                                >
                                    Select All
                                </button>
                                <button
                                    onClick={deselectAll}
                                    className="text-sm text-blue-600 hover:underline cursor-pointer"
                                >
                                    Deselect All
                                </button>
                            </div>
                        </div>
                        <div className="flex flex-col lg:flex-row gap-4">
                            <div>
                            <h4 className="font-semibold text-sm text-gray-600 mb-1">FHRS (England, Wales, NI)</h4>
                            <div className="space-y-1">
                                {fhrsRatings.map(rating => {
                                    const style = getRatingStyle(rating);
                                    return (
                                        <label key={rating} className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 p-1 rounded">
                                            <input
                                                type="checkbox"
                                                checked={selectedRatings.includes(rating)}
                                                onChange={() => toggleRating(rating)}
                                                className="cursor-pointer"
                                            />
                                            <div className={`w-8 h-8 rounded-lg ${style.colour} text-white border-2 border-black text-sm font-bold flex items-center justify-center text-center`}>
                                                {style.shortText}
                                            </div>
                                            <span className="font-semibold text-md">{style.longText}</span>
                                        </label>
                                    );
                                })}
                            </div>
                        </div>
                        <div>
                            <h4 className="font-semibold text-sm text-gray-600 mb-1">FHIS (Scotland)</h4>
                            <div className="space-y-1">
                                {fhisRatings.map(rating => {
                                    const style = getRatingStyle(rating);
                                    return (
                                        <label key={rating} className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 p-1 rounded">
                                            <input
                                                type="checkbox"
                                                checked={selectedRatings.includes(rating)}
                                                onChange={() => toggleRating(rating)}
                                                className="cursor-pointer"
                                            />
                                            <div className={`w-8 h-8 rounded-lg ${style.colour} text-white border-2 border-black text-sm font-bold flex items-center justify-center text-center`}>
                                                {style.shortText}
                                            </div>
                                            <span className="font-semibold text-md">{style.longText}</span>
                                        </label>
                                    );
                                })}
                            </div>
                        </div>
                        <div>
                            <h4 className="font-semibold text-sm text-gray-600 mb-1">Other</h4>
                            <div className="space-y-1">
                                {otherRatings.map(rating => {
                                    const style = getRatingStyle(rating);
                                    return (
                                        <label key={rating} className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 p-1 rounded">
                                            <input
                                                type="checkbox"
                                                checked={selectedRatings.includes(rating)}
                                                onChange={() => toggleRating(rating)}
                                                className="cursor-pointer"
                                            />
                                            <div className={`w-8 h-8 rounded-lg ${style.colour} text-white border-2 border-black text-sm font-bold flex items-center justify-center text-center`}>
                                                {style.shortText}
                                            </div>
                                            <span className="font-semibold text-md">{style.longText}</span>
                                        </label>
                                    );
                                })}
                            </div>
                        </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}