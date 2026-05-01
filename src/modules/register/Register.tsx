import { useState, type ChangeEvent } from "react"
import { Button, Card, Container, Form, InputGroup } from "react-bootstrap"
import { ArrowLeft, Clipboard2Check, Eye, EyeSlash } from "react-bootstrap-icons"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import Footer from "../../components/layout/Footer"
import { useLoading } from "../../context/LoadingContext"
import "../../styles/login.css"
import registerService from "./Service"

const Register = () => {
    const { endLoading, startLoading } = useLoading()
    const navigate = useNavigate()

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirm_password: ""
    })

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        if (!formData.name) {
            toast.error("Informe o nome")
            return
        }

        if (!formData.email.includes("@") || !formData.email.includes(".")) {
            toast.error("Digite um email válido")
            return
        }

        if (!formData.password) {
            toast.error("Informe a senha")
            return
        }

        if (!formData.confirm_password) {
            toast.error("Informe a confirmação da senha")
            return
        }

        if (formData.confirm_password != formData.password) {
            toast.error("As senhas devem ser iguais")
            return
        }
        try {
            startLoading()
            const { confirm_password, ...registerData } = formData;

           await registerService.register(registerData);
            toast.success("Cadastro realizado com sucesso!")
            
            setTimeout(() => {
                navigate('/login')
            }, 1000)

        } catch (err) {
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
                    <div className="x-icon" >
                        <ArrowLeft size={20} onClick={() => navigate("/login")} />
                    </div>
                    <div className="home-icon">
                        <div className="icon-circle">
                            <Clipboard2Check size={36} color="#5b5fc7" />
                        </div>
                    </div>

                    <Card.Header>Cadastrar-se</Card.Header>
                    <div className="p-2 mx-3" style={{ background: "#e5e7eb", borderRadius: 6 }}>
                        <small className="text-center d-flex justify-content-center">Ao criar a conta, você tem 7 dias de acesso gratuito</small>
                    </div>

                    <Card.Body>
                        <Form onSubmit={handleLogin}>
                            <Form.Group className="mb-3">
                                <Form.Label>Nome</Form.Label>
                                <Form.Control
                                    type="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Seu Nome"
                                    required
                                />
                            </Form.Group>
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

                            <Form.Group className="mb-3">
                                <Form.Label>Confirmar Senha</Form.Label>
                                <InputGroup>
                                    <Form.Control
                                        type={showConfirmPassword ? "text" : "password"}
                                        name="confirm_password"
                                        value={formData.confirm_password}
                                        onChange={handleChange}
                                        required
                                        placeholder="********"
                                        className="password-input"
                                    />
                                    <Button
                                        variant="outline-secondary"
                                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                                        type="button"
                                        className="show-password-icon"
                                    >
                                        {showConfirmPassword ? <EyeSlash size={18} /> : <Eye size={18} />}
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

export default Register
