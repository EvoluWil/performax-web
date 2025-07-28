import { redirect } from 'next/navigation';
import { getUserSession } from '../utils/session';

export default async function PrivateLayout() {
  const user = await getUserSession();

  if (user) {
    return redirect('/panel');
  }

  return redirect('/auth/sign-in');
}
