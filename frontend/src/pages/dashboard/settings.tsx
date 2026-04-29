import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";

import { dashboardService } from "../../services/apiClient";
import { useEffect, useState } from "react";

interface DashboardData {
  account_information: {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    phone_number: string;
    enrollment_number: string;
  };
  academic_details: {
    department: string;
    batch: string;
    student_name: string;
    father_name: string;
    mother_name: string;
  };
  library_information: {
    currently_borrowed: number;
    total_borrowed: number;
    pending_fines: number;
    membership_valid_till: string | null;
  };
}

export function Settings() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await dashboardService.fetch();
        setDashboardData(data);
        setError(null);
      } catch (err) {
        setError("Failed to load dashboard data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-4">
          <p>Loading...</p>
        </CardContent>
      </Card>
    );
  }

  if (error || !dashboardData) {
    return (
      <Card>
        <CardContent className="p-4">
          <p className="text-destructive">{error || "Failed to load data"}</p>
        </CardContent>
      </Card>
    );
  }

  const data = {
    "account information": {
      enrollmentId: dashboardData.account_information.enrollment_number,
      email: dashboardData.account_information.email,
      phone: dashboardData.account_information.phone_number,
      studyYear: dashboardData.academic_details.batch || "N/A"
    },
    "academic details": {
      course: dashboardData.academic_details.student_name || "N/A",
      semester: "6th Semester",
      section: "A",
      attendance: "87%"
    },
    "library information": {
      currentlyBorrowed: `${dashboardData.library_information.currently_borrowed} Books`,
      totalBorrowed: `${dashboardData.library_information.total_borrowed} Books`,
      membershipId: "LIB-009876",
      validTill: dashboardData.library_information.membership_valid_till || "N/A"
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
