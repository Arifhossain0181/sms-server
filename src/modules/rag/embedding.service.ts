interface EmbeddingApiResponse {
    data: Array<{
        embedding: number[];
    }>;
}

export class EmbeddingService {
    private apiKey: string;
    private apiurl: string = "https://openrouter.ai/api/v1";
    private embeddingModel: string;

    constructor() {
        this.apiKey = process.env.OPENROUTER_API_KEY || "";
        this.embeddingModel =
            process.env.OPEN_ROUTER_EMBEDING_MODEL ||
            "nvidia/nemotron-3-embed-1b:free";

        if (!this.apiKey) {
            throw new Error(
                "OPENROUTER_API_KEY is not defined in the environment variables."
            );
        }
        if (!this.embeddingModel) {
            throw new Error(
                "OPEN_ROUTER_EMBEDING_MODEL is not defined in the environment variables."
            );
        }
    }

    async generateEmbedding(text: string): Promise<number[]> {
        try {
            const response = await fetch(`${this.apiurl}/embeddings`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${this.apiKey}`,
                },
                body: JSON.stringify({
                    model: this.embeddingModel,
                    input: text,
                }),
            });

            if (!response.ok) {
                throw new Error(
                    `Failed to generate embedding: ${response.statusText}`
                );
            }

            const data: unknown = await response.json();

            if (
                !data ||
                typeof data !== "object" ||
                !("data" in data) ||
                !Array.isArray(data.data) ||
                data.data.length === 0 ||
                !data.data[0] ||
                typeof data.data[0] !== "object" ||
                !("embedding" in data.data[0]) ||
                !Array.isArray(data.data[0].embedding) ||
                !data.data[0].embedding.every(
                    (value: unknown): value is number =>
                        typeof value === "number"
                )
            ) {
                throw new Error(
                    "Invalid response embedding structure from embedding API."
                );
            }

            const embeddingResponse = data as EmbeddingApiResponse;
            return embeddingResponse.data[0].embedding;
        } catch (error) {
            console.error("Error generating embedding:", error);
            throw error;
        }
    }
}
