export const paginate = async (
  model: { count: (args: { where: any }) => Promise<number> },
  where: any,
  page: number,
  limit: number
) => {
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