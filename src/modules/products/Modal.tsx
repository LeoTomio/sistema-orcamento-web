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
        const priceNumber = Number(
            String(price).replace(/\./g, "").replace(",", ".")
        );

        if (isNaN(priceNumber)) {
            toast.warning("Preço inválido");
            return;
        }

        try {
            startLoading();
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
            onClose()
        } finally {
            endLoading();
        }
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

            setFormData(prev => ({
                ...prev,
                price: formatted
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
            const normalized = formatMoney(Number(selectedProduct.price))

            setFormData({
                ...selectedProduct,
                price: normalized
            });
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
                        <RequiredLabel>Preço R$</RequiredLabel>
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