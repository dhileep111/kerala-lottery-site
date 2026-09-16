import type { ResultStatus } from '../types';
import { useLang, t } from '../lib/i18n';

export function Badge({ status }: { status: ResultStatus }) {
  const lang = useLang();
  const label = status === 'verified' ? t(lang, 'verifiedResult')
    : status === 'live' ? t(lang, 'liveUpdate')
    : t(lang, 'pending');
  return <span className={`badge badge--${status}`}>{label}</span>;
}
