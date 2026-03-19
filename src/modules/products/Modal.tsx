import { useEffect, useState, type ChangeEvent } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import { toast } from "sonner";
import { v4 as uuid } from "uuid";
import { useLoading } from "../../context/LoadingContext";
import productService from "./Service";
import type { Product, ProductForm } from "./types";
import { formatMoney } from "../../utils/formaters";
import RequiredLabel from "../../components/RequiredLabel";

interface Props {
    show: boolean;
    onClose: () => void;
    selectedProduct: ProductForm | null;
    onSuccess: () => void;
    isFromBudget?: boolean
}

export default function ProductModal({ onClose, show, selectedProduct, onSuccess, isFromBudget }: Props) {
    const { endLoading, startLoading } = useLoading();
    const [formData, setFormData] = useState<ProductForm>({
        name: "",
        price: "",
    });

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const { name, price } = formData;

        if (!name) {
            toast.warning("Campo nome é obrigatório");
            return;
        }

        if (!price) {
            toast.warning("Campo preço é obrigatório");
            return;
        }

        const priceNumber = parseFloat(String(price));

        if (isNaN(priceNumber)) {
            toast.warning("Preço inválido");
            return;
        }

        startLoading();
        try {
            const payload: Product = {
                ...formData,
                price: priceNumber,
            };

            if (selectedProduct) {
                await productService.update(payload);
            } else {
                await productService.create({
                    ...payload,
                    id: uuid(),
                });
            }

            onSuccess();
            clearForm();
            onClose();
        } finally {
            endLoading();
        }
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        if (name === "price") {
            const normalized = value.replace(",", ".");

            setFormData(prev => ({
                ...prev,
                price: normalized
            }));

            return;
        }

        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handlePriceBlur = () => {
        if (!formData.price) return;

        const numberValue = Number(formData.price);

        if (isNaN(numberValue)) return;

        const formatted = formatMoney(numberValue);

        setFormData(prev => ({
            ...prev,
            price: formatted.replace(",", ".")
        }));
    };

    useEffect(() => {
        if (selectedProduct) {
            setFormData(selectedProduct);
        } else {
            clearForm();
        }
    }, [selectedProduct]);

    const clearForm = () => {
        setFormData({
            name: "",
            price: "",
        });
    };

    return (
        <Modal centered
            show={show}
            onHide={onClose}
            dialogClassName="product-modal"
            backdrop={isFromBudget ? false : "static"}>
            <Modal.Header closeButton>
                <Modal.Title> {selectedProduct ? "Editar" : "Cadastrar"} Produto </Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <Form onSubmit={handleSubmit}>
                    <RequiredLabel>Nome</RequiredLabel>
                    <Form.Control
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />

                    <Form.Group className="mb-3">

                        <RequiredLabel>Preço</RequiredLabel>
                        <Form.Control
                            name="price"
                            value={formData.price}
                            onChange={handleChange}
                            onBlur={handlePriceBlur}
                            required
                        />
                    </Form.Group>

                    <Button className="w-100" type="submit">
                        Salvar
                    </Button>
                </Form>
            </Modal.Body>
        </Modal>
    );
}