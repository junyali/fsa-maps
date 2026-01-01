import { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import L from 'leaflet';
import { fetchBusinesses, type Business } from '../api/businesses';
import { getRatingImage, getRatingStyle } from '../utils/ratings';

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

function FlyTo({ coordinates, businessId }: { coordinates: { lat: number; lng: number } | null | undefined; businessId?: number | null }) {
    const map = useMap();

    useEffect(() => {
        if (coordinates) {
            map.flyTo(
                [coordinates.lat, coordinates.lng],
                19,
                {
                    duration: 1.5,
                    easeLinearity: 0.25,
                }
            );

            if (businessId) {
                setTimeout(() => {
                    map.eachLayer((layer) => {
                        if (layer instanceof L.Marker) {
                            const marker = layer as L.Marker;
                            // @ts-ignore
                            // TODO: fix race condition here
                            if (marker.options.businessId === businessId) {
                                marker.openPopup();
                            }
                        }
                    });
                }, 2000)
            }
        }
    }, [coordinates, businessId, map]);

    return null;
}

export function Map({ onCountChange, selectedRatings, flyTo, flyToBusinessId }: { onCountChange: (count: number) => void; selectedRatings: string[], flyTo?: { lat: number; lng: number } | null; flyToBusinessId?: number | null; }) {
    /* DD coordinates according to the first google result */
    /* const ukCentre: [number, number] = [54.0021959912, -2.54204416515]; */

    /* central london */
    const ukCentre: [number, number] = [51.509865, -0.118092];
    const [businesses, setBusinesses] = useState<Business[]>([]);
    const [currentBounds, setCurrentBounds] = useState<{ bounds: L.LatLngBounds; zoom: number } | null>(null);

    const createIcon = (ratingValue: string | null) => {
        const style = getRatingStyle(ratingValue);

        return L.divIcon({
            html: `
                <div class="flex items-center justify-center w-8 h-8 whitespace-nowrap ${style.colour} text-white font-bold text-md rounded-lg border-2 border-black">
                    ${style.shortText}
                </div>
            `,
            className: "custom-marker",
            iconSize: [8, 8],
            iconAnchor: [4, 4],
            popupAnchor: [0, -4]
        });
    }

    useEffect(() => {
        if (currentBounds) {
            handleBoundsChange(currentBounds.bounds, currentBounds.zoom).catch();
        }
    }, [selectedRatings]);

    const handleBoundsChange = useCallback(async (bounds: L.LatLngBounds, zoom: number) => {
        setCurrentBounds({ bounds, zoom });
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

            const data = await fetchBusinesses(south, north, west, east, selectedRatings);
            setBusinesses(data);
            onCountChange(data.length);
        } catch (error) {
            console.error("Failed to fetch businesses", error);
            setBusinesses([]);
            onCountChange(0);
        } finally {
        }
    }, [selectedRatings, onCountChange]);

    return (
        <div className="w-full h-full">
            <MapContainer
                center={ukCentre}
                zoom={16}
                className="w-full h-full"
            >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                maxNativeZoom={19}
                maxZoom={24}
            />
            <MapUpdater onBoundsChange={handleBoundsChange} />
            <FlyTo coordinates={flyTo} businessId={flyToBusinessId} />
            {businesses.map(business => (
                <Marker
                    key={business.id}
                    position={[business.latitude, business.longitude]}
                    icon={createIcon(business.rating_value)}
                    // @ts-ignore
                    businessId={business.id}
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
