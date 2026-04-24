import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";

const tabs = ["all books", "available", "requested", "wishlist"];

const books = [
  { name: "Atomic Habits", author: "James Clear" },
  { name: "Python Basics", author: "Eric Matthews" },
  { name: "Critique of Pure...", author: "Immanuel Kant" }
];

export function Books() {
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
            <AllBooksTab />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

function AllBooksTab() {
  return (
    <div className="py-4 space-y-4">
      <CardTitle className="font-bold">Books</CardTitle>

      {books.map(book => (
        <Card key={book.name} className="py-2">
          <CardHeader>
            <CardTitle>{book.name}</CardTitle>
            <CardDescription>{book.author}</CardDescription>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}
