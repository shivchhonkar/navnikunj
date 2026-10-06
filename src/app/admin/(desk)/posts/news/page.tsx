import { redirect } from 'next/navigation';

export default function NewsPostsPage() {
  redirect('/admin/posts?kind=news');
}
