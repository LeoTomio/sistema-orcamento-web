import { useEffect, useState, type ChangeEvent } from "react";
import { Offcanvas } from "react-bootstrap";
import { toast } from "sonner";
import { v4 as uuid } from "uuid";
import { useLoading } from "../../context/LoadingContext";
import productService from "./Service";
import type { Product } from "./types";
import ProductForm from "./ProductForm";

interface Props {
    show: boolean;
    onClose: () => void;
    selectedProduct: Product | null;
    onSuccess: () => void;
}

export default function ProductOffcanvas({
    show,
    onClose,
    selectedProduct,
    onSuccess,
}: Props) {
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
        <Offcanvas
            show={show}
            onHide={onClose}
            placement="end"
            style={{ zIndex: 9999 }}>
            <Offcanvas.Header closeButton>
                <Offcanvas.Title>
                    {selectedProduct ? "Editar Produto" : "Cadastrar Produto"}
                </Offcanvas.Title>
            </Offcanvas.Header>

            <Offcanvas.Body>
                <ProductForm
                    formData={formData}
                    onChange={handleChange}
                    onSubmit={handleSubmit}
                />
            </Offcanvas.Body>
        </Offcanvas>
    );
}