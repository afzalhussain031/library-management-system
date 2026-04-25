import { HeartIcon, MailIcon, PauseIcon } from "lucide-react";

import { Card } from "../../ui/card";

import { cn } from "../../../utils/cn";

const data = [
  { key: "Borrowed", value: "10", icon: PauseIcon },
  { key: "Due Soon", value: "32", icon: PauseIcon },
  { key: "Total Fine", value: "$120", icon: MailIcon },
  { key: "Wishlist", value: "7", icon: HeartIcon }
];

export function TopCards({ className }: React.ComponentProps<"div">) {
  return (
    <div className={cn("grid grid-cols-[repeat(auto-fit,minmax(12rem,1fr))] gap-4", className)}>
      {data.map(value => <TopCard key={value.key} data={value} />)}
    </div>
  );
}

export function TopCard({
  data: { key, value, icon: Icon }
}: {
  data: typeof data[number];
}) {
  return (
    <Card className="p-4 flex flex-row items-center space-x-4">
      <div className="border rounded-lg p-2">
        <Icon />
      </div>

      <div className="*:block font-bold">
        <span className="text-muted-foreground">{key}</span>
        <span className="text-2xl">{value}</span>
      </div>
    </Card>
  );
}
