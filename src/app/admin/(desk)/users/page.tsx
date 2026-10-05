import { redirect } from 'next/navigation';
import { UsersDesk } from '@/components/admin/UsersDesk';
import { currentUser } from '@/lib/auth';
import { getSite } from '@/lib/store';

export default async function UsersPage() {
  const user = await currentUser();
  if (!user || user.role !== 'admin') redirect('/admin');
  const users = (await getSite()).users;
  return (
    <main>
      <h1 className="text-3xl">Users</h1>
      <p className="mt-2 mb-6 text-sm text-stone-600">Accounts that can sign in to this desk. Editors can update the site. Administrators can also manage users.</p>
      <UsersDesk users={users} currentId={user.id} />
    </main>
  );
}
