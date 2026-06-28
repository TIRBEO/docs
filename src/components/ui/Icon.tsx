import {
  Home, ChevronRight, Search, Menu, X, ArrowLeft, ArrowRight, ExternalLink,
  Code2, BookOpen, CheckCircle, Info, AlertTriangle, PenSquare, Copy,
  Users, Crosshair, Globe, Shield, ThumbsUp, ThumbsDown,
  MessageCircle, Image,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  home: Home,
  "chevron-right": ChevronRight,
  search: Search,
  menu: Menu,
  x: X,
  "arrow-left": ArrowLeft,
  "arrow-right": ArrowRight,
  "external-link": ExternalLink,
  github: Code2,
  book: BookOpen,
  "check-circle": CheckCircle,
  info: Info,
  "alert-triangle": AlertTriangle,
  edit: PenSquare,
  copy: Copy,
  users: Users,
  target: Crosshair,
  globe: Globe,
  shield: Shield,
  thumbsUp: ThumbsUp,
  thumbsDown: ThumbsDown,
  twitter: MessageCircle,
  linkedin: MessageCircle,
  discord: MessageCircle,
  image: Image,
};

export function Icon({ name, className = "" }: { name: string; className?: string }) {
  const LucideIcon = iconMap[name];
  if (!LucideIcon) return null;
  return <LucideIcon className={className} />;
}
