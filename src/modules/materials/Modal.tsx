import { useMutation } from "@tanstack/react-query";
import { useEffect, useState, type ChangeEvent } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import { toast } from "sonner";
import RequiredLabel from "../../components/RequiredLabel";
import { formatMoney } from "../../utils/formaters";
import materialService from "./Service";
import { MaterialUnitEnum, type Material, type MaterialForm } from "./types";
import CustomSelect from "../../components/CustomSelect";

interface Props {
    show: boolean;
    onClose: () => void;
    selectedMaterial: MaterialForm | null;
    onSuccess: () => void;
    isFromBudget?: boolean;
}

export default function MaterialModal({ onClose, show, selectedMaterial, onSuccess, isFromBudget }: Props) {
    const [formData, setFormData] = useState<MaterialForm>({
        name: "",
        unit: "",
        price: "",
    });

    const saveMutation = useMutation({
        mutationFn: async (data: Material) => {
            if (selectedMaterial) return materialService.update(data);

            return materialService.create(data);
        },
        onSuccess: () => {
            onSuccess();
            handleClose();
        },
        onError: () => toast.error("Erro ao salvar material"),
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const { name, unit, price } = formData;

        if (!name) return toast.warning("Campo nome é obrigatório");
        if (!unit) return toast.warning("Campo unidade é obrigatório");
        if (!price) return toast.warning("Campo preço é obrigatório");

        const priceNumber = Number(String(price).replace(/\./g, "").replace(",", "."));
        if (isNaN(priceNumber)) return toast.warning("Preço inválido");

        const payload: Material = {
            ...formData,
            price: priceNumber
        };
        saveMutation.mutate(payload);
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        if (name === "price") {
            const onlyNumbers = value.replace(/\D/g, "");
            const cents = Number(onlyNumbers) || 0;

            const formatted = (cents / 100).toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            });

            setFormData(prev => ({ ...prev, price: formatted }));
            return;
        }

        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePriceBlur = () => {
        if (!formData.price) return;

        const numberValue = Number(formData.price);
        if (isNaN(numberValue)) return;

        const formatted = formatMoney(numberValue);

        setFormData(prev => ({
            ...prev,
            price: formatted
        }));
    };

    
    useEffect(() => {
        if (!show) return;
        if (selectedMaterial) {
            const normalized = formatMoney(Number(selectedMaterial.price));

            setFormData({
                ...selectedMaterial,
                price: normalized
            });
        } else {
            clearForm();
        }
    }, [show, selectedMaterial]);

    const clearForm = () => {
        setFormData({
            name: "",
            unit: "",
            price: "",
        });
    };

    const handleClose = () => {
        clearForm();
        onClose();
    };

    const formatUnitLabel = (key: string) =>
        key.toLowerCase()
            .replace(/_/g, " ")
            .replace(/\b\w/g, (l) => l.toUpperCase());


    const materialUnitOptions = Object.entries(MaterialUnitEnum).map(
        ([key, value]) => ({
            value,
            label: formatUnitLabel(key)
        })
    );

    return (
        <Modal
            centered
            show={show}
            onHide={handleClose}
            dialogClassName="material-modal"
            backdrop={isFromBudget ? false : "static"}
        >
            <Modal.Header closeButton onHide={handleClose}>
                <Modal.Title>
                    {selectedMaterial ? "Editar" : "Cadastrar"} Material
                </Modal.Title>
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

                    <Form.Group className="mb-3">
                        <Form.Label>Unidade</Form.Label>

                        <CustomSelect
                            options={materialUnitOptions}
                            value={formData.unit}
                            onChange={(value) =>
                                value && setFormData(prev => ({ ...prev, unit: String(value) }))
                            }
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <RequiredLabel>Preço R$</RequiredLabel>
                        <Form.Control
                            name="price"
                            value={formData.price}
                            onChange={handleChange}
                            onBlur={handlePriceBlur}
                            required
                        />
                    </Form.Group>

                    <Button className="w-100" type="submit" disabled={saveMutation.isPending}>
                        {saveMutation.isPending ? "Salvando..." : "Salvar"}
                    </Button>
                </Form>
            </Modal.Body>
        </Modal>
    );
}