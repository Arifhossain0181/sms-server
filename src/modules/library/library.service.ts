import prisma from "../../config/db";

export const getMyIssuedBooks = async (studentId: string) => {
    const issuedBooks = await prisma.bookIssue.findMany({
        where: { studentId, returnDate: null },
        include: {
            book: {
                select: {
                    id: true,
                    title: true,
                    author: true,
                    isbn: true,
                },
            },
        },
        orderBy: { issueDate: "desc" },
    });

    return issuedBooks.map((issue) => ({
        id: issue.id,
        bookId: issue.book.id,
        title: issue.book.title,
        author: issue.book.author,
        isbn: issue.book.isbn,
        issueDate: issue.issueDate,
        dueDate: issue.dueDate,
        returnDate: issue.returnDate,
        fine: issue.fine,
    }));
};
