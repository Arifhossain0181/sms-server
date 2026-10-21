import { EmbeddingService } from "./embedding.service";
import { IndexingService } from "./indexing.service";

export class RagService {
    private embedingService: EmbeddingService;
    private indexingService: IndexingService;

    constructor() {
        this.embedingService = new EmbeddingService();
        this.indexingService = new IndexingService();
    }

    async ingestStudentData() {
        return await this.indexingService.indexStudentData();
    }
}
