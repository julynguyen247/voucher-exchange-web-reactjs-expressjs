import { Outlet } from "react-router-dom";
import AppHeader from "./components/layout/app.header";
import { useContext, useEffect } from "react";
import { AuthContext } from "./components/context/auth.context";
import { fetchAccountApi } from "./utils/api";

const Layout = () => {
  const { setAuth } = useContext(AuthContext);

  useEffect(() => {
    const fetchAcc = async () => {
      try {
        const res = await fetchAccountApi();

        if (res?.data) {
          setAuth({
            isAuthenticated: true,
            user: {
              email: res.data.email ?? "",
              name: res.data.name ?? "",
            },
          });
        } else {
          setAuth({
            isAuthenticated: false,
            user: {
              email: "",
              name: "",
            },
          });
        }
      } catch (err) {
       
        setAuth({
          isAuthenticated: false,
          user: {
            email: "",
            name: "",
          },
        });
      }
    };

    fetchAcc();
  }, []);

  return (
    <div>
      <AppHeader />
      <Outlet />
    </div>
  );
};

export default Layout;
