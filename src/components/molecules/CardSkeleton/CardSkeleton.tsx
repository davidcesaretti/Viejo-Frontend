import { Card } from "@/components/atoms/Card";
import { Skeleton } from "@/components/atoms/Skeleton";

export function CardSkeleton() {
  return (
    <Card variant="elevated" padding="md">
      <div className="space-y-2">
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-8 w-24" />
      </div>
    </Card>
  );
}
