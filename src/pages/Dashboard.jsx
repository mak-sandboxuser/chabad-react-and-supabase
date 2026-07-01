import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();

  const logout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <div>
      <h1>Dashboard</h1>

      <button onClick={logout}>
        Logout
      </button>
    </div>
  );
}