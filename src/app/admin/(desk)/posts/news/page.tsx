import { PostsDesk } from '@/components/admin/PostsDesk';
import { getSite } from '@/lib/store';

export default function NewsPostsPage() {
  return (
    <main className="-mt-4">
      <PostsDesk posts={getSite().posts} kind="news" noun="news post" title="News" modal pageSize={6} />
    </main>
  );
}
