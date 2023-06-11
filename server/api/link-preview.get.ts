import linkPreviewGenerator from "link-preview-generator";

export default defineEventHandler(async (e) => {
  const query = getQuery(e);
  const previewData = await linkPreviewGenerator(query.link.toString());
  return previewData;
});
