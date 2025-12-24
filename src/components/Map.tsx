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

export function Map() {
    /* DD coordinates according to the first google result */
    const ukCentre: [number, number] = [54.0021959912, -2.54204416515];
    const [businesses, setBusinesses] = useState<Business[]>([]);

    const handleBoundsChange = async (bounds: L.LatLngBounds, zoom: number) => {
        if (zoom < 16) {
            setBusinesses([])
            return;
        }
        try {
            const south = bounds.getSouth();
            const north = bounds.getNorth();
            const west = bounds.getWest();
            const east = bounds.getEast();

            const data = await fetchBusinesses(south, north, west, east);
            console.log(data.length);
            setBusinesses(data);
        } catch (error) {
            console.error("Failed to fetch businesses", error);
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
                                {business.rating}
                            </div>
                        </div>
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
        </div>
    )
}
