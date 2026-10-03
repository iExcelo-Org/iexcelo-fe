import SponsorStudentAnalytics from "./SponsorStudentAnalytics";

export default async function SponsorStudentAnalyticsPage({
  params,
}: {
  params: Promise<{ studentId: string }>;
}) {
  const { studentId } = await params;
  return <SponsorStudentAnalytics studentId={studentId} />;
}
