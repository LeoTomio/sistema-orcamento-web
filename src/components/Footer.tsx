import { Col, Container, Row } from "react-bootstrap";
import "../styles/footer.css";
import { Github, Instagram, Linkedin } from "react-bootstrap-icons";

const Footer = () => {
  return (
    <footer className="footer-container">
      <Container>
        <Row className="footer-content">

          <Col xs={12} md={4} className="footer-item">
            <span className="footer-title">Email</span>
            <p className="footer-text">leo__tomio@hotmail.com</p>
          </Col>

          <Col xs={12} md={4} className="footer-item">
            <span className="footer-title">WhatsApp</span>
            <p className="footer-text">(47) 9 8449-3179</p>
          </Col>

          <Col xs={12} md={4} className="footer-item">
            <span className="footer-title">Redes</span>

            <div className="footer-social">

              <a
                href="https://www.instagram.com/tomioleo/"
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon instagram"
              >
                <Instagram size={18} />
              </a>

              <a
                href="https://www.linkedin.com/in/leonardo-tomio-9342a91aa/"
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon linkedin"
              >
                <Linkedin size={18} />
              </a>

              <a
                href="https://github.com/LeoTomio"
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon github"
              >
                <Github size={18} />
              </a>

            </div>
          </Col>

        </Row>

        <hr />

        <Row>
          <Col className="footer-copy">
            © {new Date().getFullYear()} — Leonardo Tomio
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;