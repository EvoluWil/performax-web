import { AttendanceDetail } from '@/features/attendance';

type Props = {
  params: Promise<{ companyId: string; taskId: string }>;
};

export default async function AttendanceDetailPage({ params }: Props) {
  const { companyId, taskId } = await params;
  return <AttendanceDetail companyId={companyId} taskId={taskId} />;
}
