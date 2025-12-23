import { useEffect, useState } from 'react';
import { fetchHealth } from '../api/health';

export function HealthStatus() {
    const [status, setStatus] = useState<string>("checking...");
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchHealth()
            .then(data => setStatus(data.status))
            .catch(() => setError("Unavailable"));
    }, []);

    if (error) {
        return <p className="text-red-500">{error}</p>
    }

    return <p>API status: {status}</p>
}
