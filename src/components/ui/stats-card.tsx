"use client";

import { cn } from "@/lib/utils";

type CardColor = "blue" | "green" | "yellow" | "red" | "purple";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color?: CardColor;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const colorClasses: Record<CardColor, { bg: string; icon: string }> = {
  blue: {
    bg: "bg-blue-50",
    icon: "bg-blue-100 text-blue-600",
  },
  green: {
    bg: "bg-green-50",
    icon: "bg-green-100 text-green-600",
  },
  yellow: {
    bg: "bg-yellow-50",
    icon: "bg-yellow-100 text-yellow-600",
  },
  red: {
    bg: "bg-red-50",
    icon: "bg-red-100 text-red-600",
  },
  purple: {
    bg: "bg-purple-50",
    icon: "bg-purple-100 text-purple-600",
  },
};

export function StatsCard({
  title,
  value,
  icon,
  color = "blue",
  description,
  trend,
}: StatsCardProps) {
  const colors = colorClasses[color];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
          {description && (
            <p className="mt-1 text-sm text-gray-500">{description}</p>
          )}
          {trend && (
            <p
              className={cn(
                "mt-2 text-sm flex items-center",
                trend.isPositive ? "text-green-600" : "text-red-600"
              )}
            >
              <span className="mr-1">{trend.isPositive ? "↑" : "↓"}</span>
              {Math.abs(trend.value)}% vs gecen ay
            </p>
          )}
        </div>
        <div className={cn("p-3 rounded-xl", colors.icon)}>
          {icon}
        </div>
      </div>
    </div>
  );
}
