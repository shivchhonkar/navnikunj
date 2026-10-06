import { PostsDesk } from '@/components/admin/PostsDesk';
import { getSite } from '@/lib/store';
import type { PostKind } from '@/lib/types';

const KINDS = new Set<PostKind>(['news', 'blog', 'event']);

export default async function PostsPage({ searchParams }: { searchParams: { kind?: string } }) {
  const posts = (await getSite()).posts;
  const kind = KINDS.has(searchParams.kind as PostKind) ? searchParams.kind as PostKind : 'all';
  return (
    <main className="-mt-4">
      <PostsDesk posts={posts} initialKind={kind} modal pageSize={8} />
    </main>
  );
}
