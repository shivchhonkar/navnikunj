import { PostsDesk } from '@/components/admin/PostsDesk';
import { getSite } from '@/lib/store';

export default function EventPostsPage() {
  return (
    <main className="-mt-4">
      <PostsDesk posts={getSite().posts} kind="event" noun="event" title="Events" modal pageSize={6} />
    </main>
  );
}
