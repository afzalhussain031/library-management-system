import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { bookService } from "../../../services/apiClient";

interface RecommendedBook {
  id: number;
  title: string;
  author: string;
}

export function RecommendBooksCard({ className }: React.ComponentProps<"div">) {
  const [books, setBooks] = useState<RecommendedBook[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        // For now, fetch a few random books as recommendations
        // In future, this should call a dedicated /api/recommendations/ endpoint
        const data = await bookService.fetchAll();
        setBooks(data.slice(0, 3).map((b: any) => ({
          id: b.id || 0,
          title: b.title,
          author: b.author
        })));
      } catch (err) {
        console.error("Failed to fetch recommendations", err);
        setBooks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, []);

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="font-bold">Recommended For You</CardTitle>
        </CardHeader>
        <CardContent className="py-4">
          <p>Loading...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="font-bold">Recommended For You</CardTitle>
      </CardHeader>

      <CardContent className="py-4 space-y-4">
        {books.length === 0 ? (
          <p className="text-muted-foreground">No recommendations available</p>
        ) : (
          books.map(book => (
            <RecommendCardContent key={book.id} book={book} />
          ))
        )}
      </CardContent>
    </Card>
  );
}

function RecommendCardContent({ book }: { book: RecommendedBook }) {
  return (
    <div>
      <h4 className="font-medium">{book.title}</h4>
      <p className="text-sm text-muted-foreground">by {book.author}</p>
    </div>
  );
}
