export type Metadata = {
    download_date: string;
    source: string;
    csv_last_modified: string | null;
    total_records: number;
    imported_records: number;
    skipped_records: number;
    import_duration: number;
    data_age: number;
};

export type ApiError = {
    detail: string;
}

export async function fetchMetadata(): Promise<Metadata> {
    const res = await fetch("/api/metadata");

    if (!res.ok) {
        const error: ApiError = await res.json();
        throw new Error(error.detail || `${res.status}`);
    }

    return res.json();
}
