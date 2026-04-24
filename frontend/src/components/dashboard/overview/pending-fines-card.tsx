import { Button } from "../../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";

export function PendingFinesCard({ className }: React.ComponentProps<"div">) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="font-bold">Fines Pending</CardTitle>
      </CardHeader>

      <CardContent className="py-4 flex justify-between">
        <span className="font-bold text-lg">$50</span>
        <Button>Pay Now</Button>
      </CardContent>
    </Card>
  );
}
