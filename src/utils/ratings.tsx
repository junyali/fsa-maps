export interface RatingInfo {
    colour: string;
    shortText: string;
    longText: string;
}

const ratingStyles: Record<string, RatingInfo> = {
    "5": { colour: "bg-green-600", shortText: "5", longText: "5" },
    "4": { colour: "bg-lime-500", shortText: "4", longText: "4" },
    "3": { colour: "bg-yellow-400", shortText: "3", longText: "3" },
    "2": { colour: "bg-orange-400", shortText: "2", longText: "2" },
    "1": { colour: "bg-orange-700", shortText: "1", longText: "1" },
    "0": { colour: "bg-red-800", shortText: "0", longText: "0" },
    "pass": { colour: "bg-blue-500", shortText: "P", longText: "Pass" },
    "passandeatsafe": { colour: "bg-blue-300", shortText: "PES", longText: "Pass and Eat Safe" },
    "improvementrequired": { colour: "bg-red-600", shortText: "ImR", longText: "Improvement Required" },
    "exempt": { colour: "bg-gray-500", shortText: "Ex", longText: "Exempt" },
    "awaitingpublication": { colour: "bg-gray-400", shortText: "AwP", longText: "Awaiting Publication" },
    "awaitinginspection": { colour: "bg-gray-600", shortText: "AwI", longText: "Awaiting Inspection" },
};

const defaultRatingStyle: RatingInfo = { colour: "bg-gray-500", shortText: "N/A", longText: "N/A" };

export const getRatingImage = (ratingKey: string | null): string | null => {
    if (!ratingKey) return null;

    const lowerKey = ratingKey.toLowerCase();
    const parts = lowerKey.split("_");

    if (parts.length < 2) return null;

    const lastPart = parts[parts.length - 1];

    const scheme = parts[0];
    const culture = (lastPart === "en-gb" || lastPart === "cy-gb") ? lastPart: null;

    const ratingParts = culture ? parts.slice(1, -1) : parts.slice(1)

    const rating = ratingParts.join("_");

    if (scheme === "fhis") {
        return `/fhis/${scheme}_${rating}.jpg`;
    }

    if (scheme === "fhrs") {
        return `/fhrs/${scheme}_${rating}_${culture}.svg`;
    }

    return null;
};

export const getRatingStyle = (ratingValue: string | null): RatingInfo => {
    if (!ratingValue) return defaultRatingStyle;
    const rating = ratingValue.trim().toLowerCase().replace(/\s+/g, '')
    return ratingStyles[rating] || defaultRatingStyle;
};
