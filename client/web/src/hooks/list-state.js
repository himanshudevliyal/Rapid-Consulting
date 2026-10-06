// Adds the flags every list screen needs to a React Query result:
//   isEmpty      - loaded fine, nothing to show
//   isRefreshing - showing data while a refetch runs (not the first load)
// `pick` turns the response into the array that counts as "the items".
export const withListState = (query, pick = (data) => data?.items ?? []) => {
  const items = pick(query.data);
  return {
    ...query,
    items,
    total: query.data?.total ?? items.length,
    isEmpty: !query.isPending && !query.isError && items.length === 0,
    isRefreshing: query.isFetching && !query.isPending,
  };
};

export const LIST_STALE_MS = 60 * 1000;
