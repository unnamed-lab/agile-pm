import { redirect } from 'next/navigation';

// /projects redirects to dashboard where all projects are listed
export default function ProjectsPage() {
  redirect('/dashboard');
}
