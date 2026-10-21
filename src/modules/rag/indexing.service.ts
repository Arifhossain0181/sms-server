import { EmbeddingService } from "./embedding.service";
import prisma from "../../config/db";

import { Prisma } from "@prisma/client";

const toVectorLiteral = (vector: number[]) => `[${vector.join(",")}]`;

export class IndexingService {
    private embedingService: EmbeddingService;

    constructor() {
        this.embedingService = new EmbeddingService();
    }

    async indexStudentDataDocument(
        chunkKey: string,
        sourceType: string,
        sourceId: string,
        sourceLevel: string,
        content: string,
        metadata?: Record<string, any>
    ) {
        try {
            const embedding = await this.embedingService.generateEmbedding(content);
            const vectorLiteral = toVectorLiteral(embedding);
            await prisma.$executeRaw(Prisma.sql`
                INSERT INTO "document_embedding"
                (
                    "id",
                    "chunkKey",
                    "sourceType",
                    "sourceId",
                    "sourceLevel",
                    "content",
                    "metadata",
                    "embedding",
                    "updatedAt"
                )
                VALUES (
                    gen_random_uuid(),
                    ${chunkKey},
                    ${sourceType},
                    ${sourceId},
                    ${sourceLevel},
                    ${content},
                    ${JSON.stringify(metadata || {})}::jsonb,
                    CAST(${vectorLiteral} AS vector),
                    NOW()
                )
                ON CONFLICT ("chunkKey") DO UPDATE SET
                    "content"   = EXCLUDED."content",
                    "metadata"  = EXCLUDED."metadata",
                    "embedding" = EXCLUDED."embedding",
                    "updatedAt" = NOW()
            `);
        } catch (error) {
            console.error("Error indexing student data document:", error);
            throw error;
        }
    }

    async indexStudentData(): Promise<{ success: boolean; message: string }> {
        try {
            const students = await prisma.student.findMany({
                include: {
                    user: { select: { email: true } },
                    parent: { select: { phone: true } },
                    admissionRecord: { select: { guardianPhone: true } },
                },
            });

            let indexedCount = 0;

            for (const student of students) {
                const email = student.user.email;
                const phoneNumber =
                    student.parent?.phone ??
                    student.admissionRecord?.guardianPhone ??
                    null;

                const content = `Student Name: ${student.name}\nEmail: ${email}\nPhone Number: ${phoneNumber}\nAddress: ${student.address}\nDate of Birth: ${student.dob}\nGender: ${student.gender}\nClass ID: ${student.classId}`;

                const metadata = {
                    studentId: student.studentId,
                    name: student.name,
                    email,
                    phoneNumber,
                    address: student.address,
                    dateOfBirth: student.dob,
                    gender: student.gender,
                    classId: student.classId,
                };

                const chunkKey = `student-${student.studentId}`;

                await this.indexStudentDataDocument(
                    chunkKey,
                    "Student Data",
                    student.id,
                    "student",
                    content,
                    metadata
                );

                indexedCount++;
            }

            console.log(`Indexed ${indexedCount} students.`);
            return {
                success: true,
                message: `Indexed ${indexedCount} students successfully.`,
            };
        } catch (error) {
            console.error("Error indexing student data:", error);
            return {
                success: false,
                message: "Error occurred while indexing student data.",
            };
        }
    }
}
