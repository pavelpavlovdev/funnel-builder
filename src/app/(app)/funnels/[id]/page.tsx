import { FunnelEditor } from "@/components/funnel-editor/FunnelEditor"

export default async function FunnelEditorPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <FunnelEditor funnelId={id} />
}
