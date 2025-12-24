import { Map } from '../components/Map';
import { SideBar } from "../components/SideBar";

export function HomePage() {
    return (
        <div className="relative min-h-screen h-screen w-full">
            <Map />
            <SideBar />
        </div>
    )
}