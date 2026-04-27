import { PreviewPage } from "@/components/preview/PreviewPage"

export default async function PreviewSpecificPage({
  params,
}: {
  params: Promise<{ funnelId: string; pageId: string }>
}) {
  const { funnelId, pageId } = await params
  return <PreviewPage funnelId={funnelId} pageId={pageId} />
}
