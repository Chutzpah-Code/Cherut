import { useRouter } from 'next/navigation';

export function useClientNavigation() {
  const router = useRouter();

  const navigate = (href: string) => {
    router.push(href);
  };

  return { navigate };
}