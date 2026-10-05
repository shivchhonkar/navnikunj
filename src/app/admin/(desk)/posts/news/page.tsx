import { PostsDesk } from '@/components/admin/PostsDesk';
import { getSite } from '@/lib/store';

export default async function NewsPostsPage() {
  const posts = (await getSite()).posts;
  return (
    <main className="-mt-4">
      <PostsDesk posts={posts} kind="news" noun="news post" title="News" modal pageSize={6} />
    </main>
  );
}
