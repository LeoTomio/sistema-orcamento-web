import { Form, Button } from "react-bootstrap";
import type { Product } from "./types";
import type { ChangeEvent } from "react";

interface Props {
    formData: Product;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

export default function ProductForm({
    formData,
    onChange,
    onSubmit,
}: Props) {
    return (
        <Form onSubmit={onSubmit}>
            <Form.Group className="mb-3">
                <Form.Label>Nome</Form.Label>
                <Form.Control
                    name="name"
                    value={formData.name}
                    onChange={onChange}
                />
            </Form.Group>

            <Form.Group className="mb-3">
                <Form.Label>Preço</Form.Label>
                <Form.Control
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={onChange}
                />
            </Form.Group>

            <Button className="w-100" type="submit">
                Salvar
            </Button>
        </Form>
    );
}