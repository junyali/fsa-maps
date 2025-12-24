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

function MapUpdater({ onBoundsChange }: { onBoundsChange: (bounds: L.LatLngBounds) => void}) {
    const map = useMapEvents({
        moveend: () => {
            onBoundsChange(map.getBounds());
        },
        zoomend: () => {
            onBoundsChange(map.getBounds());
        }
    });

    useEffect(() => {
        onBoundsChange(map.getBounds());
    }, []);

    return null;
}

export function Map() {
    /* DD coordinates according to the first google result */
    const ukCentre: [number, number] = [54.0021959912, -2.54204416515];
    const [businesses, setBusinesses] = useState<Business[]>([]);

    const handleBoundsChange = async (bounds: L.LatLngBounds) => {
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
            />
            <MapUpdater onBoundsChange={handleBoundsChange} />
            {businesses.map(business => (
                <Marker
                    key={business.id}
                    position={[business.latitude, business.longitude]}
                >
                    <Popup>
                        <div className="text-sm">
                            <h3 className="font-bold">{business.name}</h3>
                            <p className="text-xs">{business.address_1}</p>
                            <p className="text-xs mt-1">Rating: <span className="font-semibold">{business.rating}</span></p>
                        </div>
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
        </div>
    )
}
