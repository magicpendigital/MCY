import { BarChartIcon, HomeIcon, PersonIcon, PlayIcon } from "@radix-ui/react-icons";
import { msg } from "../i18n";
import { useFlow } from "../mobile";
import { useRoutes } from "./navigation";
import { useDemo } from "./state";

export function BottomNav() {
  const flow = useFlow();
  const routes = useRoutes();
  const { state } = useDemo();
  const current = flow.current.id;
  const locale = state.locale;
  const items = [
    { id: "home", label: msg(locale, "journey.nav.today"), icon: <HomeIcon /> },
    { id: "journey", label: msg(locale, "journey.nav.journey"), icon: <BarChartIcon /> },
    { id: "discover", label: msg(locale, "journey.nav.discover"), icon: <PlayIcon /> },
    { id: "profile", label: msg(locale, "journey.nav.profile"), icon: <PersonIcon /> },
  ];
  return <nav className="mcy-bottom-nav" aria-label={msg(locale, "journey.navLabel")}>{items.map(item => <button key={item.id} aria-current={current === item.id ? "page" : undefined} onClick={() => { if (current !== item.id) flow.replace(routes[item.id]); }}>{item.icon}<span>{item.label}</span></button>)}</nav>;
}
