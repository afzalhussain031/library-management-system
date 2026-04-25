import { Button } from "../../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";

const borrowedBooks = [
  { name: "Atomic Habits", author: "James Clear", issuedOn: "02 Dec 2022" },
  { name: "Python Basics", author: "Eric Matthews", issuedOn: "30 Dec 2022" },
  { name: "Critique of Pure...", author: "Immanuel Kant", issuedOn: "15 Nov 2022" }
];

export function BorrowedBooksCard({ className }: React.ComponentProps<"div">) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="font-bold">My Borrowed Books</CardTitle>
      </CardHeader>

      <CardContent className="py-4 space-y-4">
        {borrowedBooks.map(book => <Book key={book.name} book={book} />)}
      </CardContent>
    </Card>
  );
}

function Book({ book }: { book: typeof borrowedBooks[number]; }) {
  return (
    <div className="flex justify-between">
      <div className="*:block">
        <span className="font-medium">{book.name}</span>
        <span className="text-muted-foreground">by {book.author}</span>
      </div>

      <div>
        <div className="*:block">
          <span className="text-muted-foreground">issued</span>
          <span>{book.issuedOn}</span>
        </div>

        <Button>Renew</Button>
      </div>
    </div>
  );
}
