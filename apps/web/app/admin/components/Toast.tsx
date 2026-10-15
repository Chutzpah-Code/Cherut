'use client';

import { useCallback, useRef, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';

export function useAdminToast() {
  const [message, setMessage] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((msg: string) => {
    setMessage(msg);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setMessage(null), 2200);
  }, []);

  const toastNode = (
    <div className={`adm-toast${message ? ' on' : ''}`}>
      <CheckCircle2 size={16} />
      <span>{message}</span>
    </div>
  );

  return { showToast, toastNode };
}
