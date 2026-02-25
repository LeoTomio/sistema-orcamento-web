import { useEffect, useState, type ChangeEvent } from "react";
import { Button, Col, Form, Modal, Row } from "react-bootstrap";
import { X } from "react-bootstrap-icons";
import { toast } from "sonner";
import { v4 as uuid } from "uuid";
import { useLoading } from "../../context/LoadingContext";
import productService from "./productService";
import type { Product } from "./ProductType";

interface Props {
    show: boolean,
    onClose: () => void
    selectedProduct: Product | null
    onSuccess: () => void;
}

export default function ProductModal({ onClose, show, selectedProduct, onSuccess }: Props) {
    const { endLoading, startLoading } = useLoading();
    const [formData, setFormData] = useState<Product>({
        name: "",
        price: 0
    })

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const { name, price } = formData
        if (!name) {
            toast.warning('Campo nome é obrigatório')
            return
        }
        if (!price) {
            toast.warning("Campo preço é obrigatório")
            return
        }

        try {
            startLoading()
            if (selectedProduct) {
                productService.update(formData)
            } else {
                productService.create({
                    ...formData,
                    id: uuid(),
                });
            }
            onSuccess()
            clearForm()
            handleClose()
        } catch (error) {
            console.log('erro ->', error)
        } finally {
            endLoading()
        }
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        setFormData(prev => ({
            ...prev,
            [name]: name === "price" ? Number(value) : value
        }));
    };

    const handleClose = () => {
        onClose();
    };

    useEffect(() => {
        if (selectedProduct) {
            setFormData(selectedProduct);
        } else {
            clearForm()
        }
    }, [selectedProduct]);

    const clearForm = () => {
        setFormData({
            name: "",
            price: 0
        })
    }

    return (
        <Modal
            centered
            show={show}
            contentClassName="p-3 mb-3"
            onHide={onClose}>
            <Row>
                <Col sm={10}>
                    <h5>{selectedProduct ? "Editar Produto" : "Cadastrar Produto"}</h5>
                </Col>
                <Col sm={2} className="d-flex justify-content-center">
                    <X size='2rem' className="x-icon" onClick={handleClose} />
                </Col>
            </Row>
            <Form className="mt-2" onSubmit={handleSubmit}>
                <Form.Group className="mb-2">
                    <Form.Label>Nome</Form.Label>
                    <Form.Control
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                    />
                </Form.Group>

                <Form.Group className="mb-2">
                    <Form.Label>Preço</Form.Label>
                    <Form.Control
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleChange}
                    />
                </Form.Group>

                <Button className="submitButton w-100 mt-2" type="submit">Salvar</Button>
            </Form>
        </Modal>
    );
}
