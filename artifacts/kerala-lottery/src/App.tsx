import { Switch, Route, Router as WouterRouter } from "wouter";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import CheckTicketPage from "./pages/CheckTicketPage";
import ClaimGuidePage from "./pages/ClaimGuidePage";
import ContactPage from "./pages/ContactPage";
import DisclaimerPage from "./pages/DisclaimerPage";
import DownloadFormsPage from "./pages/DownloadFormsPage";
import FaqPage from "./pages/FaqPage";
import GuessingNumbersPage from "./pages/GuessingNumbersPage";
import LotteryOfficesPage from "./pages/LotteryOfficesPage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import TermsPage from "./pages/TermsPage";
import LotteryResultPage from "./pages/LotteryResultPage";
import DrawArchivePage from "./pages/DrawArchivePage";
import NotFound from "./pages/not-found";

function Router() {
  return (
    <>
      <Header />
      <Switch>
        <Route path="/" component={HomePage} />
        <Route path="/about" component={AboutPage} />
        <Route path="/check-ticket" component={CheckTicketPage} />
        <Route path="/claim-guide" component={ClaimGuidePage} />
        <Route path="/contact" component={ContactPage} />
        <Route path="/disclaimer" component={DisclaimerPage} />
        <Route path="/download-forms" component={DownloadFormsPage} />
        <Route path="/faq" component={FaqPage} />
        <Route path="/guessing-numbers" component={GuessingNumbersPage} />
        <Route path="/lottery-offices" component={LotteryOfficesPage} />
        <Route path="/privacy-policy" component={PrivacyPolicyPage} />
        <Route path="/terms" component={TermsPage} />
        <Route path="/results/:slug/:drawCode" component={DrawArchivePage} />
        <Route path="/results/:slug" component={LotteryResultPage} />
        <Route component={NotFound} />
      </Switch>
      <Footer />
    </>
  );
}

function App() {
  return (
    <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
      <Router />
    </WouterRouter>
  );
}

export default App;
