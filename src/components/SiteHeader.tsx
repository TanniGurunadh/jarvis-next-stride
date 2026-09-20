import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { JarvisMark } from "./JarvisMark";

const links = [
  { to: "/" as const, label: "Home" },
  { to: "/planner" as const, label: "Study Planner" },
  { to: "/about" as const, label: "About" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="site-header">
      <nav className="page-shell grid h-16 grid-cols-[minmax(0,1fr)_auto] items-center gap-4 md:grid-cols-[1fr_auto_1fr]" aria-label="Primary navigation">
        <Link to="/" className="min-w-0" onClick={() => setOpen(false)}><JarvisMark /></Link>
        <div className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <Link key={link.to} to={link.to} activeOptions={{ exact: link.to === "/" }} className="nav-link" activeProps={{ className: "nav-link nav-link-active" }}>{link.label}</Link>
          ))}
        </div>
        <div className="hidden justify-end md:flex">
          <span className="online-pill"><span className="status-dot" />JARVIS ONLINE</span>
        </div>
        <button className="icon-button md:hidden" aria-label={open ? "Close menu" : "Open menu"} onClick={() => setOpen((value) => !value)}>{open ? <X /> : <Menu />}</button>
      </nav>
      {open && (
        <div className="mobile-menu md:hidden">
          {links.map((link) => <Link key={link.to} to={link.to} activeOptions={{ exact: link.to === "/" }} className="mobile-link" onClick={() => setOpen(false)}>{link.label}</Link>)}
          <span className="online-pill mt-2 self-start"><span className="status-dot" />JARVIS ONLINE</span>
        </div>
      )}
    </header>
  );
}
