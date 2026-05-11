import { getStatusLabel } from '@/app/data';
import type { ResultStatus } from '@/app/types';

export function Badge({ status }: { status: ResultStatus }) {
  return <span className={`badge badge--${status}`}>{getStatusLabel(status)}</span>;
}
