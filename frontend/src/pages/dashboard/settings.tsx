import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";

import { useAuth } from "../../hooks";

export function Settings() {
  const auth = useAuth();

  const data = {
    "account information": {
      enrollmentId: "ENR-2023-0456",
      email: auth.user?.email ?? "",
      phone: "1234567890",
      studyYear: "3rd Year"
    },
    "academic details": {
      course: "B.Tech Computer Science",
      semester: "6th Semester",
      section: "A",
      attendance: "87%"
    },
    "library information": {
      currentlyBorrowed: "3 Books",
      totalBorrowed: "18 Books",
      membershipId: "LIB-009876",
      validTill: "31 Dec 2026"
    }
  };

  return (
    <Card>
      <CardContent className="space-y-4">
        {Object.entries(data).map(([title, description]) => (
          <SettingsCard key={title} card={{ title, description }} />
        ))}
      </CardContent>
    </Card>
  );
}

function SettingsCard({
  card
}: {
  card: {
    title: string;
    description: Record<string, string>;
  };
}) {

  return (
    <Card>
      <CardHeader>
        <CardTitle className="capitalize">{card.title}</CardTitle>
      </CardHeader>

      <CardContent className="grid sm:grid-cols-2 gap-4">
        {Object.entries(card.description).map(([key, value]) => (
          <p key={key}>
            <span className="block capitalize text-muted-foreground">{key}</span>
            <span className="block">{value}</span>
          </p>
        ))}
      </CardContent>
    </Card>
  );
}
