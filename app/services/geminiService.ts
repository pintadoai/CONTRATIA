// geminiService.ts
// Servicio de IA que usa el proxy seguro de Netlify Functions
// La API key de Gemini NUNCA está en el código del cliente

const AI_ENDPOINT = '/api/ai-suggest';

export async function generateSuggestion(prompt: string): Promise<string> {
    try {
        const response = await fetch(AI_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ prompt }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `Error del servidor: ${response.status}`);
        }

        const data = await response.json();
        return data.suggestion || '';
    } catch (error) {
        console.error("Error calling AI service:", error);
        throw new Error("No se pudo generar la sugerencia. Intenta de nuevo.");
    }
}
