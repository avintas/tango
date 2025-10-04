import { redirect } from 'next/navigation';

export default function Home() {
  // Redirect to the professional CMS landing page
  redirect('/cms-landing');
}
