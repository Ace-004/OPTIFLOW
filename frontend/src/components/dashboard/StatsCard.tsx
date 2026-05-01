import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import type { IconType } from "react-icons";

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: IconType;
  iconColor?: string;
  iconBgColor?: string;
}

const StatsCard = ({
  title,
  value,
  change,
  changeType = "neutral",
  icon: Icon,
  iconColor = "text-violet-600",
  iconBgColor = "bg-violet-100",
}: StatsCardProps) => {
  const changeColors = {
    positive: "text-green-600 dark:text-green-300",
    negative: "text-red-600 dark:text-red-300",
    neutral: "text-slate-500 dark:text-slate-400",
  };

  return (
    <Card className="surface-card hover:-translate-y-0.5">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              {title}
            </p>
            <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">
              {value}
            </p>
            {change && (
              <p
                className={cn("text-sm font-medium", changeColors[changeType])}
              >
                {change}
              </p>
            )}
          </div>
          <div className={cn("rounded-xl p-3", iconBgColor)}>
            <Icon className={cn("w-6 h-6", iconColor)} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatsCard;
