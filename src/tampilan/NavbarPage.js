import React from "react";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";

const NavbarPage = () => {
  return (
    <Container fluid className="d-flex justify-content-between align-items-center py-2">
      <Nav.Link href="/home" style={{ color: "black", fontWeight: "bold" }}>
        Home
      </Nav.Link>
      <Nav.Link href="/history" style={{ color: "black", fontWeight: "bold" }}>
        History
      </Nav.Link>
    </Container>
  );
};

export default NavbarPage;
