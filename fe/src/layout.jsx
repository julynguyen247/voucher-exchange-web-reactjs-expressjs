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
              email: res.data.data.email ?? "",
              name: res.data.data.name ?? "",
              phone: res.data.data.phone ?? "",
              id: res.data.data._id ?? "",
              image: res.data.data.image ?? "",
            },
          });
        } else {
          setAuth({
            isAuthenticated: false,
            user: {
              email: "",
              name: "",
              phone:"",
              id:"",
              image:"",
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
