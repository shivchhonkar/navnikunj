import { redirect } from 'next/navigation';

export default function BlogPostsPage() {
  redirect('/admin/posts?kind=blog');
}
