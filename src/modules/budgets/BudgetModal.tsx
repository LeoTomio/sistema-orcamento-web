import { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { v4 as uuid } from "uuid";
import type { BudgetItem } from "./BudgetType";
import budgetService from "./budgetService";
import BudgetItemTable from "./BudgeItemTable";
import productService from "../products/productService";

interface Props {
  show: boolean;
  onClose: () => void;
  refresh: () => void;
}

export default function BudgetModal({ show, onClose, refresh }: Props) {
  const products = productService.getAll();

  const [clientName, setClientName] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("");
  const [items, setItems] = useState<BudgetItem[]>([]);

  const handleAddProduct = () => {
    const product = products.find(p => p.id === selectedProduct);
    if (!product) return;

    setItems(prev => [
      ...prev,
      {
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
      },
    ]);
  };

  const handleSave = () => {
    const total = items.reduce((acc, item) =>
      acc + item.price * item.quantity, 0);

    budgetService.create({
      id: uuid(),
      clientName,
      items,
      total,
      createdAt: new Date(),
    });

    setClientName("");
    setItems([]);
    refresh();
    onClose();
  };

  return (
    <Modal show={show} onHide={onClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Novo Orçamento</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form.Group className="mb-3">
          <Form.Label>Nome do Cliente</Form.Label>
          <Form.Control
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Produto</Form.Label>
          <Form.Select
            onChange={(e) => setSelectedProduct(e.target.value)}
          >
            <option value="">Selecione</option>
            {products.map(p => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </Form.Select>
        </Form.Group>

        <Button className="mb-3" onClick={handleAddProduct}>
          Adicionar Produto
        </Button>

        <BudgetItemTable items={items} setItems={setItems} />
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Cancelar
        </Button>
        <Button onClick={handleSave}>
          Salvar Orçamento
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
