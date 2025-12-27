import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import L from 'leaflet';
import { fetchBusinesses, type Business } from '../api/businesses';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

function MapUpdater({ onBoundsChange }: { onBoundsChange: (bounds: L.LatLngBounds, zoom: number) => void}) {
    const map = useMapEvents({
        moveend: () => {
            onBoundsChange(map.getBounds(), map.getZoom());
        },
        zoomend: () => {
            onBoundsChange(map.getBounds(), map.getZoom());
        }
    });

    useEffect(() => {
        onBoundsChange(map.getBounds(), map.getZoom());
    }, []);

    return null;
}

export function Map({ onCountChange }: { onCountChange: (count: number) => void }) {
    /* DD coordinates according to the first google result */
    const ukCentre: [number, number] = [54.0021959912, -2.54204416515];
    const [businesses, setBusinesses] = useState<Business[]>([]);

    const getRatingImage = (ratingKey: string | null): string | null => {
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
    }

    const getRatingStyle = (ratingValue: string | null): {colour: string, text: string} => {
        if (!ratingValue) return { colour: "bg-gray-500", text: "N/A" }
        const rating = ratingValue.trim().toLowerCase().replace(/\s+/g, '')

        console.log(rating)

        switch(rating) {
            case "5":
                return { colour: "bg-green-600", text: "5" };
            case "4":
                return { colour: "bg-lime-500", text: "4" };
            case "3":
                return { colour: "bg-yellow-400", text: "3" };
            case "2":
                return { colour: "bg-orange-400", text: "2" };
            case "1":
                return { colour: "bg-orange-700", text: "1" };
            case "0":
                return { colour: "bg-red-800", text: "0" };
            case "pass":
                return { colour: "bg-blue-500", text: "P" };
            case "passandeatsafe":
                return { colour: "bg-blue-300", text: "PES" };
            case "improvementrequired":
                return { colour: "bg-red-600", text: "ImR" };
            case "exempt":
                return { colour: "bg-gray-500", text: "Ex" };
            case "awaitingpublication":
                return { colour: "bg-gray-400", text: "AwP" };
            case "awaitinginspection":
                return { colour: "bg-gray-600", text: "AwI" };
            default:
                return { colour: "bg-gray-500", text: "N/A" };
        }
    }

    const createIcon = (ratingValue: string | null) => {
        const style = getRatingStyle(ratingValue);

        return L.divIcon({
            html: `
                <div class="flex items-center justify-center w-8 h-8 whitespace-nowrap ${style.colour} text-white font-bold text-md rounded-lg border-2 border-black">
                    ${style.text}
                </div>
            `,
            className: "custom-marker",
            iconSize: [8, 8],
            iconAnchor: [4, 4],
            popupAnchor: [0, -4]
        });
    }

    const handleBoundsChange = async (bounds: L.LatLngBounds, zoom: number) => {
        if (zoom < 16) {
            setBusinesses([])
            onCountChange(0);
            return;
        }
        try {
            const south = bounds.getSouth();
            const north = bounds.getNorth();
            const west = bounds.getWest();
            const east = bounds.getEast();

            const data = await fetchBusinesses(south, north, west, east);
            setBusinesses(data);
            onCountChange(data.length);
        } catch (error) {
            console.error("Failed to fetch businesses", error);
            onCountChange(0);
        } finally {
        }
    };

    return (
        <div className="w-full h-full">
            <MapContainer
                center={ukCentre}
                zoom={6}
                className="w-full h-full"
            >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                maxNativeZoom={19}
                maxZoom={24}
            />
            <MapUpdater onBoundsChange={handleBoundsChange} />
            {businesses.map(business => (
                <Marker
                    key={business.id}
                    position={[business.latitude, business.longitude]}
                    icon={createIcon(business.rating_value)}
                >
                    <Popup>
                        <div>
                            <h3 className="font-bold text-base">{business.name}</h3>
                            <div className="text-black">
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
                            </div>
                            <div className="text-gray-600">
                                {business.local_authority && (
                                    <>
                                        <br />
                                        <span>
                                            Local Authority: {business.local_authority}
                                            {business.scheme && ` [${business.scheme}]`}
                                        </span>
                                    </>
                                )}
                                {business.date && (
                                    <>
                                        <br />
                                        <span>
                                            Inspection Date: {new Date(business.date).toLocaleDateString("en-GB")}
                                        </span>
                                    </>
                                )}
                            </div>
                            <hr className="my-2 border-gray-200" />
                            <div className="text-2xl font-bold text-center">
                                <img
                                    src={getRatingImage(business.rating_key)!}
                                    alt={business.rating_value}
                                    className="max-auto"
                                />
                            </div>
                        </div>
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
        </div>
    )
}
