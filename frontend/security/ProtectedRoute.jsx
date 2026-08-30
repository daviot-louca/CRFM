import { Navigate, Outlet } from "react-router-dom";

function ProtectedRoute({ allowedRoles = [] }) {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  let userRole = null;

  try {
    const payload = JSON.parse(
      atob(token.split(".")[1])
    );

    userRole = payload?.role?.roleName ?? null;

    console.log("[AUTH] USER ROLE :", userRole);
  } catch (error) {
    console.error(
      "Impossible de lire le rôle du token :",
      error
    );

    localStorage.removeItem("token");

    return <Navigate to="/login" replace />;
  }

  if (
    allowedRoles.length > 0 &&
    !allowedRoles.includes(userRole)
  ) {
    return <Navigate to="/403" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;