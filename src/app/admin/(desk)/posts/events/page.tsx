import { redirect } from 'next/navigation';

export default function EventPostsPage() {
  redirect('/admin/posts?kind=event');
}
