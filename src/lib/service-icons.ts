import {
  Briefcase,
  Building2,
  Calculator,
  ClipboardList,
  FileText,
  FolderOpen,
  Keyboard,
  Mail,
  MonitorSmartphone,
  Puzzle,
  Globe,
  Image,
  Video,
  Music,
  type LucideIcon,
} from "lucide-react";

export const SERVICE_ICONS: Record<string, { label: string; icon: LucideIcon }> = {
  clipboard: { label: "Clipboard", icon: ClipboardList },
  keyboard: { label: "Keyboard", icon: Keyboard },
  file: { label: "Document", icon: FileText },
  monitor: { label: "Devices", icon: MonitorSmartphone },
  building: { label: "Office", icon: Building2 },
  puzzle: { label: "Puzzle piece", icon: Puzzle },
  briefcase: { label: "Briefcase", icon: Briefcase },
  folder: { label: "Folder", icon: FolderOpen },
  mail: { label: "Mail", icon: Mail },
  calculator: { label: "Calculator", icon: Calculator },
  globe: { label: "Website", icon: Globe },
  poster: { label: "Poster", icon: Image },
  video: { label: "Video", icon: Video },
  audio: { label: "Audio", icon: Music },
};

export function serviceIcon(key: string): LucideIcon {
  return SERVICE_ICONS[key]?.icon ?? Briefcase;
}
