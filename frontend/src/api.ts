export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

export async function readApiResponse<T>(response: Response): Promise<T> {
	if (!response.headers.get('content-type')?.includes('application/json')) {
		throw new Error(
			`API returned a non-JSON response (HTTP ${response.status}). Check the backend server and API URL.`,
		);
	}

	try {
		return (await response.json()) as T;
	} catch {
		throw new Error(`API returned invalid JSON (HTTP ${response.status}).`);
	}
}