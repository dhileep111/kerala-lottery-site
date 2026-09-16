import { useEffect, type ComponentType } from "react";
import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
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
import GuessingArchivePage from "./pages/GuessingArchivePage";
import LotteryGuessingPage from "./pages/LotteryGuessingPage";
import LotteryOfficesPage from "./pages/LotteryOfficesPage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import TermsPage from "./pages/TermsPage";
import LotteryResultPage from "./pages/LotteryResultPage";
import DrawArchivePage from "./pages/DrawArchivePage";
import FirstPrizePage from "./pages/FirstPrizePage";
import ChartPage from "./pages/ChartPage";
import BumperPage from "./pages/BumperPage";
import YesterdayResultPage from "./pages/YesterdayResultPage";
import SchedulePage from "./pages/SchedulePage";
import ClaimPrizePage from "./pages/ClaimPrizePage";
import JackpotPage from "./pages/JackpotPage";
import NotFound from "./pages/not-found";



// Every non-English locale the site publishes under /<locale>/. Kept in
// sync with prerender.mjs's ALT_LOCALES and generate-full-sitemap.mjs.
const ALT_LOCALES = ["ta", "ml", "hi", "kn"];

// Single source of truth for the route table — each entry is rendered once
// at its English path and once at every /<locale>-prefixed path
// (prerender.mjs statically generates real content at each; without a
// matching client-side route here too, React hydration was replacing that
// prerendered content with the catch-all NotFound the instant JS took over).
const routeConfigs: Array<{ path: string; component: ComponentType<any> }> = [
  { path: "/", component: HomePage },
  { path: "/about", component: AboutPage },
  { path: "/check-ticket", component: CheckTicketPage },
  { path: "/chart", component: ChartPage },
  { path: "/bumper", component: BumperPage },
  { path: "/yesterday-result", component: YesterdayResultPage },
  { path: "/schedule", component: SchedulePage },
  { path: "/claim-prize", component: ClaimPrizePage },
  { path: "/jackpot", component: JackpotPage },
  { path: "/claim-guide", component: ClaimGuidePage },
  { path: "/contact", component: ContactPage },
  { path: "/disclaimer", component: DisclaimerPage },
  { path: "/download-forms", component: DownloadFormsPage },
  { path: "/faq", component: FaqPage },
  { path: "/guessing-numbers", component: GuessingNumbersPage },
  { path: "/guessing-numbers/archive", component: GuessingArchivePage },
  { path: "/lottery-offices", component: LotteryOfficesPage },
  { path: "/privacy-policy", component: PrivacyPolicyPage },
  { path: "/terms", component: TermsPage },
  { path: "/results/:slug/first-prize", component: FirstPrizePage },
  { path: "/results/:slug/:drawCode/first-prize", component: FirstPrizePage },
  { path: "/results/:slug/:drawCode", component: DrawArchivePage },
  { path: "/results/:slug", component: LotteryResultPage },
];

// /guessing-numbers/:slug has no locale counterpart in prerender.mjs (no
// per-lottery translated guessing page is generated), so it's kept
// English-only here too rather than mirrored.
const englishOnlyRouteConfigs: Array<{ path: string; component: ComponentType<any> }> = [
  { path: "/guessing-numbers/:slug", component: LotteryGuessingPage },
];

function Router() {
  return (
    <>
      <Header />
      <Switch>
        {routeConfigs.map(({ path, component }) => (
          <Route key={path} path={path} component={component} />
        ))}
        {ALT_LOCALES.flatMap((locale) =>
          routeConfigs.map(({ path, component }) => (
            <Route
              key={`${locale}:${path}`}
              path={path === "/" ? `/${locale}` : `/${locale}${path}`}
              component={component}
            />
          ))
        )}
        {englishOnlyRouteConfigs.map(({ path, component }) => (
          <Route key={path} path={path} component={component} />
        ))}
        <Route component={NotFound} />
      </Switch>
      <Footer />
    </>
  );
}


function App() {
  return (
    <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")} >
      <Router />
    </WouterRouter>
  );
}

export default App;
