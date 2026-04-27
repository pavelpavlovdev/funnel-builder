import { PreviewPage } from "@/components/preview/PreviewPage"

export default async function PreviewFunnelPage({
  params,
}: {
  params: Promise<{ funnelId: string }>
}) {
  const { funnelId } = await params
  return <PreviewPage funnelId={funnelId} pageId={null} />
}
