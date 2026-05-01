import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, type ChangeEvent } from "react";
import { Button, Card, Col, Form, InputGroup, Row } from "react-bootstrap";
import { Eye, EyeSlash } from "react-bootstrap-icons";
import { toast } from "sonner";
import RequiredLabel from "../../components/RequiredLabel";
import { cacheTime } from "../../utils/enum";
import { formatPhone } from "../../utils/formaters";
import { onlyNumbers } from "../../utils/validators";
import userService from "./Service";
import type { User } from "./types";
import { useAuth } from "../../context/AuthContext";

function Users() {
    const { user: authUser } = useAuth()
    const queryClient = useQueryClient()
    const [userData, setUserData] = useState<User>({
        name: "",
        phone: "",
        address: "",
        email: "",
        password: "",
        confirmPassword: ""
    } as User);


    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const { data } = useQuery({
        queryKey: ["user", authUser?.id],
        queryFn: () => userService.getUser(),
        staleTime: cacheTime.fiveMinutes,
        refetchOnWindowFocus: false
    })

    const user = data as User

    useEffect(() => {
        if (!user) return;

        setUserData({
            ...user,
            password: "",
            confirmPassword: ""
        });

    }, [user]);

    const saveMutation = useMutation({
        mutationFn: (user: User) => userService.updateUser(user),
        onSuccess: () => {
            toast.success("Usuário atualizado com sucesso")
            queryClient.invalidateQueries({ queryKey: ["user", authUser?.id] });
        },

        onError: () => {
            toast.error('Erro ao atualizar usuário')
        }
    })

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

        saveMutation.mutate(payload);
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
            <Row className="d-flex justify-content-between align-items-center mb-4">
                <Col xs={12}>
                    <h2 className="mb-1">Dados do Usuário</h2>
                </Col>
            </Row>
            <Card className="page-container">
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
                                <InputGroup>
                                    <Form.Control
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        value={userData.password || ""}
                                        onChange={handleChange}
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
                        </Col>

                        <Col xs={12} lg={6}>
                            <Form.Group>
                                <Form.Label>Confirmar Senha</Form.Label>
                                <InputGroup>
                                    <Form.Control
                                        type={showConfirmPassword ? "text" : "password"}
                                        name="confirmPassword"
                                        value={userData.confirmPassword}
                                        onChange={handleChange}
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
                        </Col>
                        <Col xs={12} className="d-flex justify-content-center align-items-center">
                            <Button className="submitButton mt-4 w-50" type="submit" disabled={saveMutation.isPending}>
                                {saveMutation.isPending ? "Salvando..." : "Salvar"}
                            </Button>
                        </Col>
                    </Row>
                </Form>
            </Card>
        </>
    );
}

export default Users;
