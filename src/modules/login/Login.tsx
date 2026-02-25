import { useState, type ChangeEvent } from "react"
import { Button, Card, Container, Form } from "react-bootstrap"
import "../../styles/login.css"
import { useAuth } from "../../context/AuthContext"
import { useLoading } from "../../context/LoadingContext"
import { Clipboard2 } from "react-bootstrap-icons"

const Login = () => {
    const { signIn } = useAuth()
    const { endLoading, startLoading } = useLoading()

    const [formData, setFormData] = useState({
        email: "",
        password: ""
    })

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        startLoading()
        await signIn(formData.email, formData.password)
        endLoading()
    }

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }

    return (
        <Container fluid className="login-container">
            <Card>
                <div className="home-icon">
                    <div className="icon-circle">
                        <Clipboard2 size={36} />
                    </div>
                </div>

                <Card.Header>Seu Orçamento</Card.Header>
                <p className="text-center">Faça login para acessar o sistema</p>
                <Card.Body>
                    <Form onSubmit={handleLogin}>
                        <Form.Group >
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

                        <Form.Group >
                            <Form.Label>Senha</Form.Label>
                            <Form.Control
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                placeholder="********"
                            />
                        </Form.Group>

                        <Button type="submit" className="w-100 submitButton">
                            Entrar
                        </Button>

                    </Form>
                </Card.Body>
            </Card>
        </Container>
    )
}

export default Login
