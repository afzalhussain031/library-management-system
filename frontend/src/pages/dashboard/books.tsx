import { useEffect } from "react";
import { useBooks } from "../../hooks/useBooks";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";

const tabs = ["all books", "available", "requested", "wishlist"];

export function Books() {
  const { books, loading, error, fetchBooks } = useBooks();

  useEffect(() => {
    fetchBooks().catch(() => undefined);
  }, [fetchBooks]);

  return (
    <Card>
      <CardContent>
        <Tabs
          className="flex-col"
          defaultValue={tabs[0]}
        >
          <TabsList className="bg-background flex flex-wrap">
            {tabs.map(tab => (
              <TabsTrigger
                key={tab}
                className={`aria-selected:bg-primary aria-selected:text-primary-foreground capitalize`}
                value={tab}
              >{tab}</TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="all books">
            <AllBooksTab books={books} loading={loading} error={error} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

type AllBooksTabProps = {
  books: Array<{
    id?: number;
    title: string;
    author: string;
    category?: { name: string } | null;
    publisher?: { name: string } | null;
  }>;
  loading: boolean;
  error: string | null;
};

function AllBooksTab({ books, loading, error }: AllBooksTabProps) {
  if (loading) {
    return (
      <div className="py-4 space-y-4">
        <CardTitle className="font-bold">Books</CardTitle>
        <Card className="py-2">
          <CardHeader>
            <CardTitle>Loading books...</CardTitle>
            <CardDescription>Please wait while we fetch data from the server.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-4 space-y-4">
        <CardTitle className="font-bold">Books</CardTitle>
        <Card className="py-2">
          <CardHeader>
            <CardTitle>Failed to load books</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (!books.length) {
    return (
      <div className="py-4 space-y-4">
        <CardTitle className="font-bold">Books</CardTitle>
        <Card className="py-2">
          <CardHeader>
            <CardTitle>No books found</CardTitle>
            <CardDescription>There are no books available yet.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="py-4 space-y-4">
      <CardTitle className="font-bold">Books</CardTitle>

      {books.map(book => (
        <Card key={book.id ?? `${book.title}-${book.author}`} className="py-2">
          <CardHeader>
            <CardTitle>{book.title}</CardTitle>
            <CardDescription>by {book.author}</CardDescription>
            <CardDescription>
              Category: {book.category?.name ?? "Uncategorized"}
            </CardDescription>
            <CardDescription>
              Publisher: {book.publisher?.name ?? "Unknown publisher"}
            </CardDescription>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}
