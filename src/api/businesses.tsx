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
    maxLng: number,
    ratings?: string[]
): Promise<Business[]> {
    const params = new URLSearchParams({
        min_lat: minLat.toString(),
        max_lat: maxLat.toString(),
        min_lng: minLng.toString(),
        max_lng: maxLng.toString(),
    });

    if (ratings && ratings.length > 0) {
        params.append('ratings', ratings.join(","));
    }

    const res = await fetch(`/api/businesses?${params}`);

    if (!res.ok) {
        throw new Error("Failed to fetch businesses");
    }

    return res.json();
}

export async function searchBusinesses(
    name: string,
    location: string,
    ratings?: string[]
): Promise<Business[]> {
    const params = new URLSearchParams();

    if (name) params.append('name', name);
    if (location) params.append('location', location);
    if (ratings && ratings.length > 0) {
        params.append('ratings', ratings.join(","));
    }

    const res = await fetch(`/api/businesses/search?${params}`);

    if (!res.ok) {
        throw new Error("Failed to search businesses");
    }

    return res.json();
}
