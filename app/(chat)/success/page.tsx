import { Suspense } from 'react';
import SuccessClient from './SuccessClient';
import { Loader } from 'lucide-react';

export default function SuccessPage() {
  return (
    <Suspense fallback={<Loader />}>
      <SuccessClient />
    </Suspense>
  );
}