import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, type ChangeEvent } from "react";
import { Button, Card, Col, Form, InputGroup, Row } from "react-bootstrap";
import { Eye, EyeSlash } from "react-bootstrap-icons";
import { toast } from "sonner";
import RequiredLabel from "../../components/RequiredLabel";
import { cacheTime } from "../../utils/enum";
import { formatDocument, formatPhone, formatPostalCode } from "../../utils/formaters";
import { isValidCNPJ, isValidCPF, onlyNumbers } from "../../utils/validators";
import userService from "./Service";
import type { User } from "./types";
import { useAuth } from "../../context/AuthContext";
import globalService from "../../services/globalService";
import CustomSelect from "../../components/CustomSelect";

function Users() {
    const { user: authUser } = useAuth()
    const queryClient = useQueryClient()
    const [userData, setUserData] = useState<User>({
        name: "",
        phone: "",
        address: "",
        number: "",
        city: "",
        state: "",
        postalCode: "",
        email: "",
        password: "",
        confirmPassword: "",
        document: ""
    } as User);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const statesQuery = useQuery({
        queryKey: ["states"],
        queryFn: () => globalService.getStates(),
        staleTime: cacheTime.fiveMinutes
    });

    const citiesQuery = useQuery({
        queryKey: ["cities", userData.state],
        queryFn: () => globalService.getCities(userData.state),
        staleTime: cacheTime.fiveMinutes,
        enabled: !!userData.state
    });

    const { data } = useQuery({
        queryKey: ["user", authUser?.id],
        queryFn: async () => {
            try {
                const response = await userService.getUser()
                return {
                    ...response,
                    document: response.document ? formatDocument(response.document) : "",
                    postalCode: response.postalCode ? formatPostalCode(response.postalCode) : "",
                };
            } catch (err) {
                toast.error("Erro ao carregar usuário");
                throw err;
            }
        },
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
        if (!userData.postalCode) {
            toast.warning("Campo CEP é obrigatório");
            return;
        }
        if (!userData.state) {
            toast.warning("Campo estado é obrigatório");
            return;
        }

        if (!userData.city) {
            toast.warning("Campo cidade é obrigatório");
            return;
        }

        if (!userData.address) {
            toast.warning("Campo endereço é obrigatório");
            return;
        }

        if (!userData.number) {
            toast.warning("Campo número é obrigatório");
            return;
        }

        if (!userData?.email) {
            toast.warning('Campo email é obrigatório')
            return
        }

        if (!userData.email.includes("@") || !userData.email.includes(".")) {
            toast.error("O email é inválido")
            return
        }
        const numbers = onlyNumbers(userData.document);

        if (userData.document && (numbers.length !== 11 && numbers.length !== 14)) {
            toast.warning("Documento deve ter 11 ou 14 dígitos");
            return;
        }

        if (userData.document && (numbers.length === 11 && !isValidCPF(userData.document))) {
            toast.warning("CPF inválido");
            return;
        }

        if (userData.document && (numbers.length === 14 && !isValidCNPJ(userData.document))) {
            toast.warning("CNPJ inválido");
            return;
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
            number: userData.number,
            city: userData.city,
            state: userData.state,
            postalCode: userData.postalCode,
            document: numbers,
            ...(userData.password ? { password: userData.password } : {})
        };

        saveMutation.mutate(payload);
    }

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        let formatedValue = value;

        if (name === "document") {
            formatedValue = formatDocument(value);

        } else if (name === "phone") {
            formatedValue = onlyNumbers(value).slice(0, 11);

        } else if (name === "postalCode") {
            const numbers = onlyNumbers(value).slice(0, 8);

            formatedValue = numbers.replace(
                /^(\d{5})(\d)/,
                "$1-$2"
            );
        }

        setUserData(prev => ({
            ...prev,
            [name]: formatedValue
        }));
    };

    const handlePostalCode = async (value: string) => {
        const numbers = onlyNumbers(value).slice(0, 8);

        const formatted = numbers.replace(
            /^(\d{5})(\d)/,
            "$1-$2"
        );

        setUserData(prev => ({
            ...prev,
            postalCode: formatted
        }));

        if (numbers.length === 8) {
            try {
                const response = await globalService.getAddressByPostalCode(numbers);

                setUserData(prev => ({
                    ...prev,
                    postalCode: formatted,
                    address: response.logradouro || "",
                    city: response.localidade || "",
                    state: response.uf || "",
                }));

            } catch {
                toast.warning("CEP não encontrado");
            }
        }
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

                        <Col lg={3} xs={12}>
                            <Form.Group className="mb-2">
                                <Form.Label>CPF/CNPJ</Form.Label>
                                <Form.Control
                                    name="document"
                                    value={userData?.document}
                                    onChange={handleChange}
                                    placeholder="Digite CPF ou CNPJ"
                                />
                            </Form.Group>
                        </Col>
                        <Col lg={3} xs={12}>
                            <Form.Group className="mb-2">
                                <RequiredLabel>CEP</RequiredLabel>
                                <Form.Control
                                    name="postalCode"
                                    value={userData.postalCode || ""}
                                    onChange={(e) => handlePostalCode(e.target.value)}
                                    placeholder="00000-000"
                                    inputMode="numeric"
                                />
                            </Form.Group>
                        </Col>

                        <Col lg={2} xs={12}>
                            <Form.Group className="mb-2">
                                <RequiredLabel>Estado</RequiredLabel>
                                <CustomSelect
                                    options={statesQuery.data?.map((s: any) => ({
                                        value: s.sigla,
                                        label: s.sigla,
                                    }))
                                        .sort((a: any, b: any) =>
                                            a.label.localeCompare(b.label)
                                        ) || []
                                    }
                                    value={userData.state}
                                    isLoading={statesQuery.isLoading}
                                    onChange={(value) =>
                                        setUserData(prev => ({
                                            ...prev,
                                            state: String(value),
                                            city: ""
                                        }))
                                    }
                                />
                            </Form.Group>
                        </Col>

                        <Col lg={4} xs={12}>
                            <Form.Group className="mb-2">
                                <RequiredLabel>Cidade</RequiredLabel>

                                <CustomSelect
                                    options={citiesQuery.data?.map((s: any) => ({
                                        value: s.nome,
                                        label: s.nome,
                                    })).sort((a: any, b: any) =>
                                        a.label.localeCompare(b.label)
                                    ) || []
                                    }
                                    value={userData.city}
                                    isLoading={citiesQuery.isLoading}
                                    onChange={(value) =>
                                        setUserData(prev => ({
                                            ...prev,
                                            city: String(value)
                                        }))
                                    }
                                />
                            </Form.Group>
                        </Col>

                        <Col lg={9} xs={12}>
                            <Form.Group className="mb-2">
                                <RequiredLabel>Endereço</RequiredLabel>

                                <Form.Control
                                    name="address"
                                    value={userData.address}
                                    onChange={handleChange}
                                    placeholder="Rua, avenida..."
                                />
                            </Form.Group>
                        </Col>

                        <Col lg={3} xs={12}>
                            <Form.Group className="mb-2">
                                <RequiredLabel>Número</RequiredLabel>

                                <Form.Control
                                    name="number"
                                    value={userData.number}
                                    onChange={handleChange}
                                    placeholder="123"
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
