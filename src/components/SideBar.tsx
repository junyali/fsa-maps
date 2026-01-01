import { useEffect, useState } from 'react';
import { fetchMetadata, type Metadata } from '../api/metadata';
import { searchBusinesses, type Business } from '../api/businesses';
import { getRatingStyle, getRatingImage } from "../utils/ratings";

const allRatings = ["5", "4", "3", "2", "1", "0", "passandeatsafe", "pass", "improvementrequired", "exempt", "awaitingpublication", "awaitinginspection"];
const fhrsRatings = ["5", "4", "3", "2", "1", "0"];
const fhisRatings = ["passandeatsafe", "pass", "improvementrequired"];
const otherRatings = ["exempt", "awaitingpublication", "awaitinginspection"];

export function SideBar({
                            isOpen,
                            count,
                            selectedRatings,
                            onRatingsChange,
                            onFlyTo
                        }: {
    isOpen: boolean;
    count: number;
    selectedRatings: string[];
    onRatingsChange: (ratings: string[]) => void;
    onFlyTo: (lat: number, lng: number, businessId?: number | null) => void;
}) {
    const [metadata, setMetadata] = useState<Metadata | null>(null);
    const [error, setError] = useState<string | null>(null);

    const [searchName, setSearchName] = useState("");
    const [searchLocation, setSearchLocation] = useState("");
    const [searchResults, setSearchResults] = useState<Business[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    const handleSearch = async () => {
        if (!searchName && !searchLocation) {
            setSearchResults([]);
            return;
        }

        setIsSearching(true);
        try {
            const results = await searchBusinesses(searchName, searchLocation, selectedRatings);
            setSearchResults(results);
        } catch (error) {
            console.error("Search failed:", error);
            setSearchResults([]);
        } finally {
            setIsSearching(false);
        }
    }

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
            <div
                className={`lg:relative lg:w-full lg:h-full absolute w-full top-0 right-0 h-full bg-white overflow-y-auto transition-transform duration-100 ${isOpen ? 'translate-y-0' : 'translate-y-full lg:translate-y-0'}`}
                style={{
                    zIndex: isOpen ? 1000 : 0
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
                            This unofficial map is for informational purposes only, and is not affiliated with or
                            endorsed by the Food Standards Agency or Food Standards Scotland. Data may be inaccurate
                            and/or incomplete. Due to missing or incorrect location data, some businesses may not appear
                            on the map or may be displayed in the wrong location.
                        </p>
                    </div>
                    <div className="w-full h-0.5 bg-gray-100"/>
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
                                            <label key={rating}
                                                   className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 p-1 rounded">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedRatings.includes(rating)}
                                                    onChange={() => toggleRating(rating)}
                                                    className="cursor-pointer"
                                                />
                                                <div
                                                    className={`w-8 h-8 rounded-lg ${style.colour} text-white border-2 border-black text-sm font-bold flex items-center justify-center text-center`}>
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
                                            <label key={rating}
                                                   className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 p-1 rounded">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedRatings.includes(rating)}
                                                    onChange={() => toggleRating(rating)}
                                                    className="cursor-pointer"
                                                />
                                                <div
                                                    className={`w-8 h-8 rounded-lg ${style.colour} text-white border-2 border-black text-sm font-bold flex items-center justify-center text-center`}>
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
                                            <label key={rating}
                                                   className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 p-1 rounded">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedRatings.includes(rating)}
                                                    onChange={() => toggleRating(rating)}
                                                    className="cursor-pointer"
                                                />
                                                <div
                                                    className={`w-8 h-8 rounded-lg ${style.colour} text-white border-2 border-black text-sm font-bold flex items-center justify-center text-center`}>
                                                    {style.shortText}
                                                </div>
                                                <span className="font-semibold text-md">{style.longText}</span>
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                        <h4 className="font-bold text-lg">Search</h4>
                        <div className="space-y-2">
                            <div>
                                <label className="text-sm font-semibold text-gray-600">Business Name</label>
                                <input
                                    type="text"
                                    value={searchName}
                                    onChange={(e) => setSearchName(e.target.value)}
                                    placeholder="Business Ltd"
                                    className="w-full px-3 py-2 border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-semibold text-gray-600">Street, town or postcode</label>
                                <input
                                    type="text"
                                    value={searchLocation}
                                    onChange={(e) => setSearchLocation(e.target.value)}
                                    placeholder="Flat 2, 12 Arbour Road, London"
                                    className="w-full px-3 py-2 border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <button
                                onClick={handleSearch}
                                disabled={isSearching || (!searchName && !searchLocation)}
                                className="w-full bg-blue-600 border-2 border-blue-800 text-white py-2 font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:border-gray-200 disabled:cursor-not-allowed"
                            >
                                {isSearching ? "Searching..." : "Search"}
                            </button>
                        </div>
                    </div>
                    <div className="w-full h-0.5 bg-gray-100"/>
                    <div className="bg-gray-100 border-2 border-gray-200 p-2">
                        <div className="flex justify-between items-center mb-2">
                            <h4 className="font-semibold text-lg text-grat-600">
                                Results ({searchResults.length})
                            </h4>
                            <button
                                onClick={() => {
                                    setSearchResults([]);
                                    setSearchName("");
                                    setSearchLocation("");
                                }}
                                className="text-sm text-blue-600 hover:underline hover:cursor-pointer"
                            >
                                Clear
                            </button>
                        </div>
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                            {searchResults.map((business) => (
                                <div
                                    key={business.id}
                                    onClick={() => {
                                        if (business.latitude && business.longitude) {
                                            onFlyTo(business.latitude, business.longitude, business.id);
                                        }
                                    }}
                                    className="bg-white border-2 border-gray-200 p-3 cursor-pointer hover:bg-gray-50 hover:border-blue-500 transition-colors flex gap-3"
                                >
                                    <div className="flex-1">
                                        <h5 className="font-bold text-sm">{business.name}</h5>
                                        <p className="text-xs text-gray-600">
                                            {[business.address_1, business.address_2, business.address_3, business.address_4]
                                                .filter((line, index, array) =>
                                                    line &&
                                                    line.trim() !== "" &&
                                                    array.indexOf(line) === index
                                                )
                                                .map((line, index, array) => (
                                                    <span key={index}>
                                                        {line}
                                                        {index < array.length - 1 && <br />}
                                                    </span>
                                                ))
                                            }
                                            {business.postcode && <><br /><span className="font-medium">{business.postcode}</span></>}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {business.local_authority}
                                            {business.scheme && ` [${business.scheme}]`}
                                        </p>
                                        {business.date && (
                                            <p className="text-xs text-gray-500">
                                                Inspected: {new Date(business.date).toLocaleDateString("en-GB")}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex-shrink-0 w-64 flex items-center">
                                        {getRatingImage(business.rating_key) && (
                                            <img
                                                src={getRatingImage(business.rating_key)!}
                                                alt={business.rating_value}
                                                className="w-full h-auto"
                                            />
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}