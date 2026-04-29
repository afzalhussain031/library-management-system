import { useEffect, useState } from "react";
import { HeartIcon, MailIcon, PauseIcon } from "lucide-react";

import { Card } from "../../ui/card";

import { cn } from "../../../utils/cn";
import { loanService, fineService, wishlistService } from "../../../services/apiClient";

interface TopCardData {
  borrowed: number;
  dueSoon: number;
  totalFine: number;
  wishlist: number;
}

export function TopCards({ className }: React.ComponentProps<"div">) {
  const [data, setData] = useState<TopCardData>({
    borrowed: 0,
    dueSoon: 0,
    totalFine: 0,
    wishlist: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [loans, fines, wishlist] = await Promise.all([
          loanService.fetchMyLoans(),
          fineService.fetchMyFines(),
          wishlistService.fetch()
        ]);

        // Count active loans
        const activeLoans = loans.filter((l: any) => !l.returned_at);

        // Sum unpaid fines (ensure amount is a number)
        const totalFines = fines.reduce((sum: number, fine: any) => {
          if (fine.status === "paid" || fine.is_paid) return sum;
          const amount = typeof fine.amount === "string" ? parseFloat(fine.amount) : fine.amount;
          return sum + (isNaN(amount) ? 0 : amount);
        }, 0);

        setData({
          borrowed: activeLoans.length,
          dueSoon: 0, // Would need to calculate based on due dates
          totalFine: totalFines,
          wishlist: wishlist.length
        });
      } catch (err) {
        console.error("Failed to fetch top card data", err);
        setData({
          borrowed: 0,
          dueSoon: 0,
          totalFine: 0,
          wishlist: 0
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const cardData = [
    { key: "Borrowed", value: loading ? "..." : String(data.borrowed), icon: PauseIcon },
    { key: "Due Soon", value: loading ? "..." : String(data.dueSoon), icon: PauseIcon },
    { key: "Total Fine", value: loading ? "..." : `$${data.totalFine.toFixed(2)}`, icon: MailIcon },
    { key: "Wishlist", value: loading ? "..." : String(data.wishlist), icon: HeartIcon }
  ];

  return (
    <div className={cn("grid grid-cols-[repeat(auto-fit,minmax(12rem,1fr))] gap-4", className)}>
      {cardData.map(value => <TopCard key={value.key} data={value} />)}
    </div>
  );
}

export function TopCard({
  data: { key, value, icon: Icon }
}: {
  data: typeof cardData[number];
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
