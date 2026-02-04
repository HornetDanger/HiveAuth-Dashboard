import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string | null): string {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleDateString("tr-TR", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDateShort(dateString: string | null): string {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleDateString("tr-TR", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function getPlanLabel(plan: string): string {
  const labels: Record<string, string> = {
    free: "Ucretsiz",
    starter: "Baslangic",
    professional: "Profesyonel",
    enterprise: "Kurumsal",
  };
  return labels[plan] || plan;
}

export function getRoleLabel(role: string): string {
  const labels: Record<string, string> = {
    owner: "Sahip",
    admin: "Yonetici",
    member: "Uye",
  };
  return labels[role] || role;
}

export function truncateEmail(email: string, maxLength: number = 25): string {
  if (email.length <= maxLength) return email;
  const [local, domain] = email.split("@");
  const truncatedLocal = local.slice(0, Math.max(5, maxLength - domain.length - 4)) + "...";
  return `${truncatedLocal}@${domain}`;
}
