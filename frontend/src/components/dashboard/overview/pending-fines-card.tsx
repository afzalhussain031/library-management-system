import { useEffect, useState } from "react";
import { Button } from "../../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { fineService } from "../../../services/apiClient";

export function PendingFinesCard({ className }: React.ComponentProps<"div">) {
  const [totalFines, setTotalFines] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFines = async () => {
      try {
        const fines = await fineService.fetchMyFines();
        const total = fines
          .filter((f: any) => !f.is_paid && f.status !== "paid")
          .reduce((sum: number, fine: any) => {
            const amount = typeof fine.amount === "string" ? parseFloat(fine.amount) : fine.amount;
            return sum + (isNaN(amount) ? 0 : amount);
          }, 0);
        setTotalFines(total);
      } catch (err) {
        console.error("Failed to fetch fines", err);
        setTotalFines(0);
      } finally {
        setLoading(false);
      }
    };

    fetchFines();
  }, []);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="font-bold">Fines Pending</CardTitle>
      </CardHeader>

      <CardContent className="py-4 flex justify-between">
        <span className="font-bold text-lg">
          ${loading ? "..." : totalFines.toFixed(2)}
        </span>
        <Button>Pay Now</Button>
      </CardContent>
    </Card>
  );
}
