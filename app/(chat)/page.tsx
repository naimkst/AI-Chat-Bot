import { Suspense } from 'react';
import HomeClient from './HomeClient';
import { Loader } from 'lucide-react';

export default function HomePage() {
  return (
    <Suspense fallback={<Loader />}>
      <HomeClient />
    </Suspense>
  );
}