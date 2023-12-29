import { useLocation, Navigate, Outlet } from "react-router-dom";

const RequireAuth = ({ allowedRoles }) => {
  const location = useLocation();
  const obj = localStorage.getItem("user");
  const userObj = JSON.parse(obj);

  let roles = [];
  if (userObj != null) roles.push(userObj[0].properties.userType);
  return allowedRoles?.includes(userObj[0]?.properties.userType) ? (
    <Outlet />
  ) : userObj ? (
    <Navigate to="/unauthorized" state={{ from: location }} replace />
  ) : (
    <Navigate to="/login" state={{ from: location }} replace />
  );
};

export default RequireAuth;
