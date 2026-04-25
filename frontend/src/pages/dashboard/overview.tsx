import { TopCards } from "../../components/dashboard/overview/top-card";
import { BorrowedBooksCard } from "../../components/dashboard/overview/borrowed-books-card";
import { NotificationsCard } from "../../components/dashboard/overview/notifications-card";
import { RecommendBooksCard } from "../../components/dashboard/overview/recommend-card";
import { PendingFinesCard } from "../../components/dashboard/overview/pending-fines-card";

export function Overview() {
  return (
    <div className="grid lg:grid-cols-8 gap-4">
      <TopCards className="lg:col-span-8" />
      <BorrowedBooksCard className="lg:col-span-5" />
      <NotificationsCard className="lg:col-span-3" />
      <RecommendBooksCard className="lg:col-span-5" />
      <PendingFinesCard className="lg:col-span-3" />
    </div>
  );
}
