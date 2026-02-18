import { getAdminIdentity } from "@/lib/auth";
import GroupsClient from "@/components/GroupsClient";

export default function GroupsPage() {
  const admin = getAdminIdentity();
  if (!admin) {
    return (
      <div className="card">
        <h1 className="h1">Not signed in</h1>
        <p className="muted">Go to <a href="/login">/login</a></p>
      </div>
    );
  }
  return <GroupsClient />;
}
