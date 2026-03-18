import { useEffect, useState, type ChangeEvent } from "react";
import { Button, Card, Col, Form, Row } from "react-bootstrap";
import { toast } from "sonner";
import RequiredLabel from "../../components/RequiredLabel";
import { useLoading } from "../../context/LoadingContext";
import { formatPhone } from "../../utils/formaters";
import { onlyNumbers } from "../../utils/validators";
import userService from "./Service";
import type { User } from "./types";

function Users() {
    const { startLoading, endLoading } = useLoading()
    const [userData, setUserData] = useState<User>({
        name: "",
        phone: "",
        address: "",
        email: "",
        password: "",
        confirmPassword: ""
    } as User);

    useEffect(() => {
        loadUser();
    }, []);

    const loadUser = async () => {
        const response = await userService.getUser();

        setUserData({
            ...response,
            password: "",
            confirmPassword: ""
        });
    };


    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!userData?.name) {
            toast.warning('Campo nome é obrigatório')
            return
        }
        if (!userData?.phone) {
            toast.warning('Campo telefone é obrigatório')
            return
        }

        if (!userData?.address) {
            toast.warning('Campo endereço é obrigatório')
            return
        }
        if (!userData?.email) {
            toast.warning('Campo email é obrigatório')
            return
        }
        if (!userData.email.includes("@") || !userData.email.includes(".")) {
            toast.error("O email é inválido")
            return
        }

        if (userData?.password && !userData?.confirmPassword) {
            toast.warning('Para alterar a senha é necessário confirmar senha')
            return
        }
        if (userData?.password != userData?.confirmPassword) {
            toast.warning('As senhas devem ser iguais para altera-las')
            return
        }
        const payload = {
            name: userData.name,
            email: userData.email,
            phone: userData.phone,
            address: userData.address,
            ...(userData.password ? { password: userData.password } : {})
        };

        startLoading()
        try {
            await userService.updateUser(payload)
            toast.success('Usuário atualizado com sucesso')
        } catch (error) {
            toast.error('Erro ao atualizar usuário')
        } finally {
            endLoading()
        }
    }

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        let formatedValue = value

        if (name === "phone") {
            formatedValue = onlyNumbers(value).slice(0, 11);
        }

        setUserData(prev => ({
            ...prev,
            [name]: formatedValue
        }));
    };


    return (
        <>
            <Card className="p-4 mb-4">
                <h5 className="mb-0">Dados do Usuário</h5>
                <Form onSubmit={handleSubmit} className="mt-2">
                    <Row>
                        <Col xs={12} lg={6}>
                            <Form.Group className="mb-1">
                                <RequiredLabel>Nome</RequiredLabel>
                                <Form.Control
                                    name="name"
                                    value={userData?.name || ""}
                                    onChange={handleChange}

                                />
                            </Form.Group>
                        </Col>
                        <Col xs={12} lg={6}>
                            <Form.Group className="mb-1">
                                <RequiredLabel>Telefone</RequiredLabel>
                                <Form.Control
                                    name="phone"
                                    value={formatPhone(userData?.phone || "")}
                                    onChange={handleChange}

                                />
                            </Form.Group>
                        </Col>
                        <Col xs={12}>
                            <Form.Group className="mb-1">
                                <RequiredLabel>Endereço</RequiredLabel>
                                <Form.Control
                                    name="address"
                                    value={userData?.address || ""}
                                    onChange={handleChange}

                                />
                            </Form.Group>
                        </Col>
                        <hr className="mt-4" />
                        <h5 className="d-flex justify-content-center">Informações de Acesso</h5>
                        <Col xs={12}>
                            <Form.Group className="mb-1">
                                <RequiredLabel>Email</RequiredLabel>
                                <Form.Control
                                    name="email"
                                    value={userData?.email || ""}
                                    onChange={handleChange}

                                />
                            </Form.Group>
                        </Col>
                        <Col xs={12} lg={6}>
                            <Form.Group>
                                <Form.Label>Senha</Form.Label>
                                <Form.Control
                                    name="password"
                                    type="password"
                                    value={userData.password || ""}
                                    onChange={handleChange}

                                />
                            </Form.Group>
                        </Col>
                        <Col xs={12} lg={6}>
                            <Form.Group>
                                <Form.Label>Confirmar Senha</Form.Label>
                                <Form.Control
                                    name="confirmPassword"
                                    type="password"
                                    value={userData.confirmPassword || ""}
                                    onChange={handleChange}

                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Button className="w-100 mt-4" type="submit">
                        Salvar
                    </Button>
                </Form>
            </Card>
        </>
    );
}

export default Users;
