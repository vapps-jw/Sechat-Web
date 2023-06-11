import { linkPreview } from "~/utilities/linkPreview";

export default defineEventHandler(async (e) => {
  const query = getQuery(e);
  const previewData = await linkPreview(query.link.toString());
  return previewData;
});
