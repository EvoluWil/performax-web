import TaskDetailPage from '@/features/task/pages/detail/page';

type Props = {
  params: { id: string };
};

const Page = ({ params }: Props) => {
  // Render the feature's detail page (it handles client hooks)
  return <TaskDetailPage params={params} />;
};

export default Page;
