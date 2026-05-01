import { useEffect, useState } from "react";
import { Button } from "../../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { loanService } from "../../../services/apiClient";

interface LoanData {
  id: number;
  book_title: string;
  book_author: string;
  issued_at: string;
}

export function BorrowedBooksCard({ className }: React.ComponentProps<"div">) {
  const [borrowedBooks, setBorrowedBooks] = useState<LoanData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLoans = async () => {
      try {
        const data = await loanService.fetchMyLoans();
        // Filter only active loans (not returned)
        const activeLoans = data.filter((loan: any) => !loan.returned_at);
        setBorrowedBooks(activeLoans);
        setError(null);
      } catch (err) {
        setError("Failed to fetch borrowed books");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchLoans();
  }, []);

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="font-bold">My Borrowed Books</CardTitle>
        </CardHeader>
        <CardContent className="py-4">
          <p>Loading...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="font-bold">My Borrowed Books</CardTitle>
        </CardHeader>
        <CardContent className="py-4">
          <p className="text-destructive">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="font-bold">My Borrowed Books</CardTitle>
      </CardHeader>

      <CardContent className="py-4 space-y-4">
        {borrowedBooks.length === 0 ? (
          <p className="text-muted-foreground">No borrowed books</p>
        ) : (
          borrowedBooks.map(loan => <Book key={loan.id} book={loan} />)
        )}
      </CardContent>
    </Card>
  );
}

function Book({ book }: { book: LoanData }) {
  const issuedDate = new Date(book.issued_at).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });

  return (
    <div className="flex justify-between">
      <div className="*:block">
        <span className="font-medium">{book.book_title}</span>
        <span className="text-muted-foreground">by {book.book_author}</span>
      </div>

      <div>
        <div className="*:block">
          <span className="text-muted-foreground">issued</span>
          <span>{issuedDate}</span>
        </div>

        <Button>Renew</Button>
      </div>
    </div>
  );
}
