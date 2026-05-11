import type { Metadata } from 'next';
import { ResultTable } from '@/components/ResultTable';
import { getResultWithLottery } from '../data';
import { TicketSearch } from './ticket-search';

export const metadata: Metadata = {
  title: 'Kerala Lottery Ticket Checker',
  description: 'Check a ticket number against the latest Kerala Lottery result data shown on this website.'
};

export default function CheckTicketPage() {
  const latest = getResultWithLottery();
  return (
    <main className="page"><div className="container">
      <div className="hero"><h1>Ticket Number Checker</h1><p>Search the latest result table. Always verify official records before any claim.</p></div>
      {latest ? <TicketSearch lottery={latest.lottery.name} drawCode={latest.result.drawCode} result={latest.result} /> : <p>No result available.</p>}
    </div></main>
  );
}
