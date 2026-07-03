import CustomerExperience from "@/components/CustomerExperience";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function TablePage({ params }: PageProps) {
  const { id } = await params;
  return <CustomerExperience defaultTableId={id} />;
}
