import { PageBuilder } from "@/components/page-builder/PageBuilder"

export default async function PageBuilderPage({
  params,
}: {
  params: Promise<{ id: string; pageId: string }>
}) {
  const { id, pageId } = await params
  return <PageBuilder funnelId={id} pageId={pageId} />
}
