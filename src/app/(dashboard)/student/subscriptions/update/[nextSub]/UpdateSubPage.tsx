import UpdateSub from "./UpdateSub";

interface PageProps {
  params: Promise<{ nextSub: string }>;
}

export default async function UpdateSubPage({ params }: PageProps) {
  const { nextSub } = await params;
  return <UpdateSub targetPlanId={nextSub} />;
}
