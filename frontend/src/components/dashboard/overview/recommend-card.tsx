import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";

const recommendBooks = [
  { name: "Atomic Habits" },
  { name: "Python Basics" },
  { name: "Critique of Pure..." }
];

export function RecommendBooksCard({ className }: React.ComponentProps<"div">) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="font-bold">Recommended For You</CardTitle>
      </CardHeader>

      <CardContent className="py-4 space-y-4">
        {recommendBooks.map(book => <RecommendCardContent key={book.name} {...{ book }} />)}
      </CardContent>
    </Card>
  );
}

function RecommendCardContent({ book }: { book: typeof recommendBooks[number]; }) {
  return (
    <div>
      <h4 className="font-medium">{book.name}</h4>
    </div>
  );
}
