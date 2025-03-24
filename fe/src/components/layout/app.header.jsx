import React, { useContext } from "react";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import NavDropdown from "react-bootstrap/NavDropdown";
import { AuthContext } from "../context/auth.context";
import { logoutApi } from "../../utils/api";
import { Image } from "antd";
const AppHeader = () => {
  const { auth, setAuth } = useContext(AuthContext);
  const handleLogout = async () => {
    const res = await logoutApi();
    if (res && res.data) {
      localStorage.clear("access_token");
      setAuth({
        isAuthenticated: false,
        user: {
          email: "",
          name: "",
          phone: "",
          id: "",
          image: "",
        },
      });
    }
  };
  return (
    <Navbar expand="lg" className="bg-primary navbar-dark ">
      <Container>
        <Navbar.Brand
          href="/"
          style={{ width: "50px", height: "50px", marginBottom: "5px" }}
        >
          {auth.isAuthenticated ? (
            <Image
              src={`${import.meta.env.VITE_BACKEND_URL}/images/upload/logo.jpg`}
              style={{
                width: "50px",
                height: "50px",
                border: "1px solid white",
                borderRadius: "50%",
                objectFit: "cover",
            
              }}
            />
          ) : (
            <div className="mt-2">Welcome</div>
          )}
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link href="/">Home</Nav.Link>
            <Nav.Link href="/voucher">Voucher</Nav.Link>
            {auth.isAuthenticated ? (
              <NavDropdown title={"Options"} id="basic-nav-dropdown">
                 <NavDropdown.Item href="/account">
                 Manage Account
                </NavDropdown.Item>
                <NavDropdown.Item href="/create-voucher">
                  Create Voucher{" "}
                </NavDropdown.Item>
                <NavDropdown.Item href="#action/3.3">
                  Exchange History
                </NavDropdown.Item>

                <NavDropdown.Item href="/" onClick={handleLogout}>
                  Logout
                </NavDropdown.Item>
              </NavDropdown>
            ) : (
              <Nav.Link href="/login">Login</Nav.Link>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default AppHeader;
