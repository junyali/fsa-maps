export type Business = {
    id: number
    name: string
    address_1: string
    address_2: string
    address_3: string
    address_4: string
    postcode: string
    latitude: number
    longitude: number
    local_authority: string
    pending: string
    date: string
    scheme: string
    rating_key: string
    rating_value: string
}

export async function fetchBusinesses(
    minLat: number,
    maxLat: number,
    minLng: number,
    maxLng: number
): Promise<Business[]> {
    const params = new URLSearchParams({
        min_lat: minLat.toString(),
        max_lat: maxLat.toString(),
        min_lng: minLng.toString(),
        max_lng: maxLng.toString(),
    });

    const res = await fetch(`/api/businesses?${params}`);

    if (!res.ok) {
        throw new Error("Failed to fetch businesses");
    }

    return res.json();
}
