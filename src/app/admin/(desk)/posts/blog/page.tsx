import { PostsDesk } from '@/components/admin/PostsDesk';
import { getSite } from '@/lib/store';

export default async function BlogPostsPage() {
  const posts = (await getSite()).posts;
  return (
    <main className="-mt-4">
      <PostsDesk posts={posts} kind="blog" noun="blog post" title="Blogs" modal pageSize={6} />
    </main>
  );
}
