import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useState, type ChangeEvent } from "react";
import { Button, Col, Form, Modal, Row, Table } from "react-bootstrap";
import { TrashFill } from "react-bootstrap-icons";
import { toast } from "sonner";
import RequiredLabel from "../../components/RequiredLabel";
import { cacheTime } from "../../utils/enum";
import { formatMoney } from "../../utils/formaters";
import materialService from "../materials/Service";
import productService from "./Service";
import type { Product, ProductForm } from "./types";
import { useAuth } from "../../context/AuthContext";

interface Props {
    show: boolean;
    onClose: () => void;
    selectedProduct: ProductForm | null;
    onSuccess: () => void;
    isFromBudget?: boolean;
}

export default function ProductModal({ onClose, show, selectedProduct, onSuccess, isFromBudget }: Props) {
    const { user } = useAuth()
    const [formData, setFormData] = useState<ProductForm>({
        name: "",
        hasHeight: true,
        hasWidth: true,
        materials: []
    });

    const materialsQuery = useQuery({
        queryKey: ["materials", user?.id],
        queryFn: () => materialService.getAll(),
        staleTime: cacheTime.fiveMinutes,
        enabled: !!user?.id
    });

    const availableOptions =
        materialsQuery.data?.data
            .filter(m => !formData.materials.some(item => item.materialId === m.id))
            .sort((a, b) => a.name.localeCompare(b.name))
            .map(m => ({ value: m.id!, label: m.name, price: m.price })) ?? [];

    const saveMutation = useMutation({
        mutationFn: async (data: Product) => {
            if (selectedProduct) return productService.update({
                ...data,
                id: selectedProduct.id
            });
            return productService.create(data);
        },
        onSuccess: () => {
            onSuccess();
            handleClose();
        },
        onError: () => toast.error("Erro ao salvar produto"),
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!formData.name.trim()) return toast.warning("Campo nome é obrigatório");
        if (formData.materials.length === 0) return toast.warning("Adicione ao menos 1 material");

        const price = formData.materials.reduce((acc, item) => {
            const mat = materialsQuery.data?.data.find(m => m.id === item.materialId);
            return acc + (Number(mat?.price) ?? 0) * item.quantity;
        }, 0);

        const payload: Product = { ...formData, price };
        saveMutation.mutate(payload);
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value, checked, type } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    };

    const handleAddMaterial = (materialId: string) => {
        const mat = materialsQuery.data?.data.find(m => m.id === materialId);
        if (!mat) return;

        setFormData(prev => ({
            ...prev,
            materials: [
                ...prev.materials,
                {
                    materialId: mat.id!,
                    quantity: 1,
                    calc_type: "AREA" // área como padrão mais comum
                }
            ]
        }));
    };

    const updateMaterial = (index: number, field: string, value: any) => {
        const updated = [...formData.materials];
        (updated[index] as any)[field] = value;

        setFormData(prev => ({ ...prev, materials: updated }));
    };

    const removeMaterial = (index: number) => {
        const updated = [...formData.materials];
        const item = updated[index];

        // se já existe no banco, marcar como deletado
        if (item.id) {
            updated[index] = {
                ...item,
                _delete: true
            };
        } else {
            // se não existe no banco, remover normalmente
            updated.splice(index, 1);
        }

        setFormData(prev => ({ ...prev, materials: updated }));
    };

    const productDetailsQuery = useQuery({
        queryKey: ["product", user?.id, selectedProduct?.id],
        queryFn: () => productService.getById(selectedProduct?.id!),
        enabled: !!selectedProduct?.id && show && !!user?.id,
    });

    useEffect(() => {
        if (productDetailsQuery.data) {
            setFormData({
                name: productDetailsQuery.data.name,
                hasHeight: productDetailsQuery.data.hasHeight,
                hasWidth: productDetailsQuery.data.hasWidth,
                materials: productDetailsQuery.data.materials ?? []
            });
        }
    }, [productDetailsQuery.data]);

    const clearForm = () => {
        setFormData({
            name: "",
            hasHeight: true,
            hasWidth: true,
            materials: []
        });
    };

    const handleClose = () => {
        clearForm();
        onClose();
    };

    const totalPrice = formData.materials.reduce((acc, item) => {
        const mat = materialsQuery.data?.data.find(m => m.id === item.materialId);
        return acc + (Number(mat?.price) ?? 0) * item.quantity;
    }, 0);

    const getDimensionMessage = () => {
        const { hasHeight, hasWidth } = formData;

        if (hasHeight && hasWidth) {
            return "de 1 metro de largura por 1 metro de altura";
        }

        if (hasHeight) {
            return "de 1 metro de altura";
        }

        if (hasWidth) {
            return "de 1 metro de largura";
        }

        return "com as características definidas para este produto";
    };

    const getBasePriceLabel = () => {
        const { hasHeight, hasWidth } = formData;

        if (hasHeight && hasWidth) {
            return "(1m x 1m)";
        }

        if (hasHeight) {
            return "(1m de altura)";
        }

        if (hasWidth) {
            return "(1m de largura)";
        }

        return ""; // nenhum dos dois
    };

    return (
        <Modal centered show={show} onHide={handleClose} size="lg" backdrop={isFromBudget ? false : "static"}>
            <Modal.Header closeButton>
                <Modal.Title>{selectedProduct ? "Editar" : "Cadastrar"} Produto</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                        <RequiredLabel>Nome</RequiredLabel>
                        <Form.Control
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                    </Form.Group>

                    <Row className="d-flex justify-content-center align-items-center">
                        <Col>
                            <Form.Check
                                name="hasHeight"
                                checked={formData.hasHeight}
                                onChange={handleChange}
                                label={
                                    <span className="ms-2">
                                        Possui Altura?
                                    </span>
                                }
                            />
                        </Col>

                        <Col>
                            <Form.Check
                                name="hasWidth"
                                checked={formData.hasWidth}
                                onChange={handleChange}
                                label={
                                    <span className="ms-2">
                                        Possui Largura?
                                    </span>
                                }
                            />
                        </Col>
                    </Row>

                    <div className="p-2 my-3" style={{ background: "#e5e7eb", borderRadius: 6 }}>
                        <small>
                            <strong>Atenção:</strong> informe abaixo quanto de cada material é consumido
                            para um produto <strong>{getDimensionMessage()}</strong>.
                            O sistema calculará automaticamente para outras medidas no orçamento.
                        </small>
                    </div>

                    <Form.Group className="mb-3">
                        <Form.Label>Adicionar Material</Form.Label>

                        <Form.Select
                            onChange={(e) => e.target.value && handleAddMaterial(e.target.value)}
                        >
                            <option value="">Selecione...</option>
                            {availableOptions.map(m => (
                                <option key={m.value} value={m.value}>{m.label}</option>
                            ))}
                        </Form.Select>
                    </Form.Group>

                    <Table bordered>
                        <thead>
                            <tr>
                                <th>Material</th>
                                <th className="text-center">Quant. Base</th>
                                <th className="text-center">Tipo Cálculo</th>
                                <th className="text-center">Preço</th>
                                <th className="text-center">Subtotal</th>
                                <th className="text-center">Ação</th>
                            </tr>
                        </thead>

                        <tbody>
                            {formData.materials.filter(item => !item._delete).map((item, i) => {
                                const mat = materialsQuery.data?.data.find(m => m.id === item.materialId);
                                return (
                                    <tr key={i}>
                                        <td className="align-content-center">{mat?.name}</td>

                                        <td className="align-content-center text-center">
                                            <Form.Control
                                                type="number"
                                                min={0}
                                                value={item.quantity}
                                                onChange={(e) =>
                                                    updateMaterial(i, "quantity", Number(e.target.value))
                                                }
                                            />
                                        </td>

                                        <td className="align-content-center text-center">
                                            <Form.Select
                                                value={item.calc_type}
                                                onChange={(e) =>
                                                    updateMaterial(i, "calc_type", e.target.value)
                                                }
                                            >
                                                <option value="AREA">Área (L x A)</option>
                                                <option value="PERIMETER">Perímetro</option>
                                                <option value="HEIGHT">Altura</option>
                                                <option value="WIDTH">Largura</option>
                                                <option value="FIXED">Fixo</option>
                                            </Form.Select>
                                        </td>

                                        <td className="align-content-center text-center">R$ {Number(mat?.price || 0).toFixed(2)}</td>

                                        <td className="align-content-center text-center">
                                            R$ {(item.quantity * (Number(mat?.price) || 0)).toFixed(2)}
                                        </td>

                                        <td className="align-content-center text-center">
                                            <TrashFill
                                                size="1.5rem"
                                                color="red"
                                                role="button"
                                                onClick={() => { removeMaterial(i) }}
                                            />
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </Table>

                    <hr className="mt-5" />
                    <Table>
                        <tbody>
                            <tr className="borderless">
                                <td>
                                    Preço base total {getBasePriceLabel() ? `${getBasePriceLabel()}:` : ":"}</td>
                                <td className="text-end"> R$ {formatMoney(totalPrice)}</td>
                            </tr>
                        </tbody>
                    </Table>
                    <Button className="w-100" type="submit" disabled={saveMutation.isPending}>
                        {saveMutation.isPending ? "Salvando..." : "Salvar"}
                    </Button>
                </Form>
            </Modal.Body>
        </Modal>
    );
}