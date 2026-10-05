import { PostsDesk } from '@/components/admin/PostsDesk';
import { getSite } from '@/lib/store';

export default async function EventPostsPage() {
  const posts = (await getSite()).posts;
  return (
    <main className="-mt-4">
      <PostsDesk posts={posts} kind="event" noun="event" title="Events" modal pageSize={6} />
    </main>
  );
}
