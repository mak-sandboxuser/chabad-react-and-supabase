import { useEffect, useState } from "react";
import { buildCurrentUserData, fetchNotifications, fetchProfile, getAuthUser } from "../services/memberData";

export function useCurrentUser() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState({ userName: "Member", notificationCount: 0 });

  useEffect(() => {
    const load = async () => {
      try {
        const user = await getAuthUser();
        const [profile, notifications] = await Promise.all([
          fetchProfile(user.id),
          fetchNotifications(user.id),
        ]);
        setData(buildCurrentUserData(profile, user, notifications));
      } catch (err) {
        setError(err.message || "Failed to load user.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return { loading, error, ...data };
}
