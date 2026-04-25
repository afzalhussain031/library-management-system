import { Button } from "../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";

const books = [
  { name: "Atomic Habits", author: "James Clear" },
  { name: "Python Basics", author: "Eric Matthews" },
  { name: "Critique of Pure...", author: "Immanuel Kant" }
];

export function Wishlist() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-bold">Wishlist</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {books.map(book => (
          <BookCard key={book.name} {...{ book }} />
        ))}
      </CardContent>
    </Card>
  );
}

function BookCard({ book }: { book: typeof books[number]; }) {
  return (
    <Card className="px-4 py-2 flex flex-row justify-between items-center">
      <div>
        <CardTitle>{book.name}</CardTitle>
        <CardDescription>{book.author}</CardDescription>
      </div>

      <Button>Borrow</Button>
    </Card>
  );
}
