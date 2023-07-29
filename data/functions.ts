export const hasOccurrences = (item: string, queryText: string) => {
  console.log("Lookup item", item);
  console.log("Lookup queryText", queryText);
  const queryParts = queryText.toLowerCase().split(" ");
  if (queryParts.length > 0) {
    return queryParts.map((x) => item.indexOf(x) > -1).reduce((a, b) => a && b);
  }

  return true;
};
