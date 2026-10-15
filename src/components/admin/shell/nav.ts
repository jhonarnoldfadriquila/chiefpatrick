import {
  BuildingsIcon,
  CalendarCheckIcon,
  CalendarIcon,
  ChatsCircleIcon,
  ForkKnifeIcon,
  GearSixIcon,
  ImagesIcon,
  PackageIcon,
  QuotesIcon,
  SquaresFourIcon,
  type Icon,
} from "@phosphor-icons/react";

export const ADMIN_NAV: { href: string; label: string; icon: Icon }[] = [
  { href: "/admin", label: "Dashboard", icon: SquaresFourIcon },
  { href: "/admin/menu", label: "Menu Management", icon: ForkKnifeIcon },
  { href: "/admin/packages", label: "Catering Packages", icon: PackageIcon },
  { href: "/admin/events", label: "Events", icon: CalendarCheckIcon },
  { href: "/admin/reservations", label: "Reservations", icon: CalendarIcon },
  { href: "/admin/inquiries", label: "Inquiries", icon: ChatsCircleIcon },
  { href: "/admin/gallery", label: "Gallery", icon: ImagesIcon },
  { href: "/admin/testimonials", label: "Testimonials", icon: QuotesIcon },
  { href: "/admin/venues", label: "Venues", icon: BuildingsIcon },
  { href: "/admin/settings", label: "Website Settings", icon: GearSixIcon },
];

export const isActive = (pathname: string, href: string) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));
