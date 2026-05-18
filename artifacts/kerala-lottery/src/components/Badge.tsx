import { getStatusLabel } from '../data';
import type { ResultStatus } from '../types';

export function Badge({ status }: { status: ResultStatus }) {
  return <span className={`badge badge--${status}`}>{getStatusLabel(status)}</span>;
}
