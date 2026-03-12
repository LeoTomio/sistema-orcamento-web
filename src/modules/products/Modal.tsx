import { useEffect, useState, type ChangeEvent } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import { toast } from "sonner";
import { v4 as uuid } from "uuid";
import { useLoading } from "../../context/LoadingContext";
import productService from "./Service";
import type { Product } from "./types";

interface Props {
    show: boolean;
    onClose: () => void;
    selectedProduct: Product | null;
    onSuccess: () => void;
    isFromBudget?: boolean
}

export default function ProductModal({ onClose, show, selectedProduct, onSuccess, isFromBudget }: Props) {
    const { endLoading, startLoading } = useLoading();
    const [formData, setFormData] = useState<Product>({
        name: "",
        price: 0,
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

        try {
            startLoading();

            if (selectedProduct) {
                await productService.update(formData);
            } else {
                await productService.create({
                    ...formData,
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

        setFormData(prev => ({
            ...prev,
            [name]: name === "price" ? Number(value) : value,
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
            price: 0,
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
                    <Form className="mb-3">
                        <Form.Label>Nome</Form.Label>
                        <Form.Control
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                        />
                    </Form>

                    <Form.Group className="mb-3">
                        <Form.Label>Preço</Form.Label>
                        <Form.Control
                            type="number"
                            name="price"
                            value={formData.price}
                            onChange={handleChange}
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