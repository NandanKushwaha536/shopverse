export const getPagination = (page = 1, limit = 8) => {
  const currentPage = Number(page);
  const perPage = Number(limit);

  return {
    currentPage,
    perPage,
    skip: (currentPage - 1) * perPage,
  };
};