import CollapsibleSection from "./CollapsibleSection";
import { users } from "../data/user_data";
import { USER } from "../data/user_data";

export function UsersBody({ users }: { users: USER[] }) {
  return (
    <>
      <pre>{JSON.stringify(users, null, 2)}</pre>
    </>
  );
}

export default function Users() {
  const title = `${users.length} Users`;
  return (
    <CollapsibleSection title={title}>
      <UsersBody users={users} />
    </CollapsibleSection>
  );
}
