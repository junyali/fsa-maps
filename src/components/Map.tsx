import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

export function Map() {
    /* DD coordinates according to the first google result */
    const ukCentre: [number, number] = [54.0021959912, -2.54204416515];

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
            <Marker position={[51.505, -0.09]}>
                <Popup>
                    imagine a chippy here
                </Popup>
            </Marker>
        </MapContainer>
        </div>
    )
}
