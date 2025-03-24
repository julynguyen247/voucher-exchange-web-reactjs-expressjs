import React, { useContext } from "react";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import NavDropdown from "react-bootstrap/NavDropdown";
import { AuthContext } from "../context/auth.context";
import { logoutApi } from "../../utils/api";

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
        },
      });
    }
  };
  return (
  
      <Navbar expand="lg" className="bg-success navbar-dark ">
        <Container>
          <Navbar.Brand href="/">{`Welcome ${auth.user.name}`}</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link href="/">Home</Nav.Link>
              <Nav.Link href="/voucher">Voucher</Nav.Link>
              <NavDropdown
                title={"Options"}
                id="basic-nav-dropdown"
              >
                <NavDropdown.Item href="/account">Manage Account </NavDropdown.Item>
                <NavDropdown.Item href="/create-voucher">
                  Create Voucher{" "}
                </NavDropdown.Item>
                <NavDropdown.Item href="#action/3.3">
                  Exchange History
                </NavDropdown.Item>
                {auth.isAuthenticated ? (
                  <NavDropdown.Item href="/" onClick={handleLogout}>
                    Logout
                  </NavDropdown.Item>
                ) : (
                  <NavDropdown.Item href="/login">Login</NavDropdown.Item>
                )}
              </NavDropdown>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

  );
};

export default AppHeader;
