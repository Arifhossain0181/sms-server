"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paginate = void 0;
const paginate = async (model, where, page, limit) => {
    const safePage = Number.isNaN(page) || page < 1 ? 1 : page;
    const safeLimit = Number.isNaN(limit) || limit < 1 ? 10 : limit;
    const skip = (safePage - 1) * safeLimit;
    const take = safeLimit;
    const total = await model.count({ where });
    return {
        skip,
        take,
        meta: {
            page: safePage,
            limit: safeLimit,
            total,
            totalPages: Math.ceil(total / safeLimit),
        },
    };
};
exports.paginate = paginate;
