'use client';

import { useTranslations } from 'next-intl';

export function PaceSelector({ onSelect }: { onSelect: (pace: 7 | 14) => void }) {
  const t = useTranslations('learning.course');

  return (
    <div className="lrn-pace">
      <b style={{ fontSize: 14, fontWeight: 600 }}>{t('pace')}</b>
      <div className="lrn-pace-seg">
        <button type="button" onClick={() => onSelect(7)}>{t('pace7')}</button>
        <button type="button" onClick={() => onSelect(14)}>{t('pace14')}</button>
      </div>
    </div>
  );
}
