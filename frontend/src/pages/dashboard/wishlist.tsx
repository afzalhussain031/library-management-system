import { useEffect, useState } from "react";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { wishlistService } from "../../services/apiClient";

interface WishlistBook {
  id: number;
  book: {
    id: number;
    title: string;
    author: string;
  };
  added_at: string;
}

export function Wishlist() {
  const [books, setBooks] = useState<WishlistBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const data = await wishlistService.fetch();
        setBooks(data);
        setError(null);
      } catch (err) {
        setError("Failed to load wishlist");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, []);

  const handleRemove = async (wishlistId: number) => {
    try {
      await wishlistService.remove(wishlistId);
      setBooks(books.filter(b => b.id !== wishlistId));
    } catch (err) {
      console.error("Failed to remove from wishlist", err);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="font-bold">Wishlist</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>Loading...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="font-bold">Wishlist</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-destructive">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-bold">Wishlist</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {books.length === 0 ? (
          <p className="text-muted-foreground">Your wishlist is empty</p>
        ) : (
          books.map(book => (
            <BookCard 
              key={book.id} 
              book={book}
              onRemove={() => handleRemove(book.id)}
            />
          ))
        )}
      </CardContent>
    </Card>
  );
}

function BookCard({ 
  book, 
  onRemove 
}: { 
  book: WishlistBook;
  onRemove: () => void;
}) {
  return (
    <Card className="px-4 py-2 flex flex-row justify-between items-center">
      <div>
        <CardTitle>{book.book.title}</CardTitle>
        <CardDescription>{book.book.author}</CardDescription>
      </div>

      <Button onClick={onRemove} variant="destructive" size="sm">Remove</Button>
    </Card>
  );
}
