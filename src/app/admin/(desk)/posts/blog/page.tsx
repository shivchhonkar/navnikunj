import { PostsDesk } from '@/components/admin/PostsDesk';
import { getSite } from '@/lib/store';

export default function BlogPostsPage() {
  return (
    <main className="-mt-4">
      <PostsDesk posts={getSite().posts} kind="blog" noun="blog post" title="Blogs" modal pageSize={6} />
    </main>
  );
}
