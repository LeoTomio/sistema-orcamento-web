import { useState, type ChangeEvent } from "react"
import { Button, Card, Container, Form } from "react-bootstrap"
import "../../styles/login.css"
import { useAuth } from "../../context/AuthContext"
import { useLoading } from "../../context/LoadingContext"

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
                <Card.Header>Meu orçamento</Card.Header>
                <Card.Body>
                    <Form onSubmit={handleLogin}>

                        <Form.Group className="form-row">
                            <Form.Label>Email</Form.Label>
                            <Form.Control
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </Form.Group>

                        <Form.Group className="form-row">
                            <Form.Label>Senha</Form.Label>
                            <Form.Control
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                        </Form.Group>

                        <Button type="submit" className="w-100">
                            Entrar
                        </Button>

                    </Form>
                </Card.Body>
            </Card>
        </Container>
    )
}

export default Login
