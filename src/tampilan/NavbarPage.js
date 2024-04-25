import React from "react";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";

const NavbarPage = () => {
  return (
    <Navbar expand="lg">
      <Container>
        <Navbar.Brand href="/home">
          <Nav.Link href="/home" style={{ color: "black", fontWeight: "bold" }}>
            Home
          </Nav.Link>
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto right">
            <Nav.Link
              href="/home"
              style={{ color: "black", fontWeight: "bold" }}
            >
              Map
            </Nav.Link>
            <Nav.Link
              href="/history"
              style={{ color: "black", fontWeight: "bold" }}
            >
              History
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavbarPage;
