import { useState, type ChangeEvent } from "react"
import { Button, Card, Container, Form, InputGroup } from "react-bootstrap"
import "../../styles/login.css"
import { useAuth } from "../../context/AuthContext"
import { useLoading } from "../../context/LoadingContext"
import { Clipboard2, Eye, EyeSlash } from "react-bootstrap-icons"
import Footer from "../../components/layout/Footer"
import { toast } from "sonner"

const Login = () => {
    const { signIn } = useAuth()
    const { endLoading, startLoading } = useLoading()

    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        email: "",
        password: ""
    })

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        if (!formData.email.includes("@") || !formData.email.includes(".")) {
            toast.error("Digite um email válido")
            return
        }

        if (!formData.password) {
            toast.error("Informe a senha")
            return
        }

        try {
            startLoading()
            await signIn(formData.email, formData.password)

        } finally {
            endLoading()
        }
    }

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }

    return (
        <div className="d-flex flex-column min-vh-100">
            <Container fluid className="login-container flex-grow-1 d-flex align-items-center justify-content-center">
                <Card style={{ width: "100%", maxWidth: "400px" }}>
                    <div className="home-icon">
                        <div className="icon-circle">
                            <Clipboard2 size={36} color="#5b5fc7" />
                        </div>
                    </div>

                    <Card.Header>Seu Orçamento</Card.Header>
                    <p className="text-center">Faça login para acessar o sistema</p>

                    <Card.Body>
                        <Form onSubmit={handleLogin}>

                            <Form.Group className="mb-3">
                                <Form.Label>Email</Form.Label>
                                <Form.Control
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="seu@email.com"
                                    required
                                />
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Senha</Form.Label>

                                <InputGroup>
                                    <Form.Control
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                        placeholder="********"
                                        className="password-input"
                                    />

                                    <Button
                                        variant="outline-secondary"
                                        onClick={() => setShowPassword((prev) => !prev)}
                                        type="button"
                                        className="show-password-icon"
                                    >
                                        {showPassword ? <EyeSlash size={18} /> : <Eye size={18} />}
                                    </Button>
                                </InputGroup>
                            </Form.Group>

                            <Button type="submit" className="w-100 submitButton">
                                Entrar
                            </Button>

                        </Form>
                    </Card.Body>
                </Card>
            </Container>

            <Footer />

        </div>
    )
}

export default Login
