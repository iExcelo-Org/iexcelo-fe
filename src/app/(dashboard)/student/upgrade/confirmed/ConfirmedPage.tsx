import SubscriptionConfirmed from "./SubscriptionConfirmed";

interface PageProps {
  searchParams: Promise<{
    session_id?: string;
    reference?: string;
  }>;
}

export default async function ConfirmedPage({ searchParams }: PageProps) {
  const params = await searchParams;

  return (
    <SubscriptionConfirmed
      sessionId={params.session_id}
      reference={params.reference}
    />
  );
}
