class PaginationService {
  getPaginationParams(query, defaultLimit = 10) {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || defaultLimit;
    const skip = (page - 1) * limit;

    return { page, limit, skip };
  }

  formatResponse(items, page, limit) {
    const hasNextPage = items.length > limit;
    const results = hasNextPage ? items.slice(0, -1) : items;

    return {
      items: results,
      pagination: {
        page,
        limit,
        hasNextPage,
      },
    };
  }

  getSortOption(query, defaultSort = "-createdAt") {
    if (query.sort === "name") return "name";
    if (query.sort === "oldest") return "createdAt";
    if (query.sort === "newest") return "-createdAt";
    return defaultSort;
  }
}

module.exports = new PaginationService();
