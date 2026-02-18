import { useState } from "react";
import { Button, Form, Card } from "react-bootstrap";
import { v4 as uuid } from "uuid";
import productService from "./productService";

interface Props {
    refresh: () => void;
}

export default function ProductForm({ refresh }: Props) {
    const [name, setName] = useState("");
    const [price, setPrice] = useState("");

    const handleSubmit = () => {
        if (!name || !price) return;

        productService.create({
            id: uuid(),
            name,
            price: Number(price),
        });

        setName("");
        setPrice("");
        refresh();
    };

    return (
        <Card className="p-3 mb-3">
            <h5>Cadastrar Produto</h5>
            <Form>
                <Form.Group className="mb-2">
                    <Form.Label>Nome</Form.Label>
                    <Form.Control
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </Form.Group>

                <Form.Group className="mb-2">
                    <Form.Label>Preço</Form.Label>
                    <Form.Control
                        type="number"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                    />
                </Form.Group>

                <Button onClick={handleSubmit}>Salvar</Button>
            </Form>
        </Card>
    );
}
