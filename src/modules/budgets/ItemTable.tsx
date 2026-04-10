import { Card, Form, Table, Button, Row, Col } from "react-bootstrap";
import { TrashFill } from "react-bootstrap-icons";
import { useEffect, useMemo } from "react";
import { calculateQuoteItem } from "./calcAux";
import type { Material } from "../materials/types";
import type { ProductResponse } from "../products/types";
import { formatMoney } from "../../utils/formaters";

interface Props {
    items: any[];
    onChangeItems: (items: any[]) => void;
    products: ProductResponse[];
    materialsMap: Map<string, Material>;
    onTotalChange: (total: number) => void;
}

export default function BudgetItemCards({ items, onChangeItems, products, materialsMap, onTotalChange }: Props) {

    const updateItem = (index: number, field: string, value: any) => {
        const updated = [...items];
        updated[index] = { ...updated[index], [field]: value };
        onChangeItems(updated);
    };

    const removeItem = (index: number) => {
        onChangeItems(items.filter((_, i) => i !== index));
    };

    const calculated = useMemo(() => {
        return items.map(item => {
            const product = products.find(p => p.id === item.productId);
            if (!product) return null;
            return calculateQuoteItem(item, product, materialsMap);
        })
            .filter(Boolean) as any[];
    }, [items, products, materialsMap]);

    const grandTotal = calculated.reduce((sum, c) => sum + c.subtotal, 0);

    useEffect(() => {
        onTotalChange(grandTotal);
    }, [grandTotal, onTotalChange]);
    return (
        <div className="budget-items-div">
            {/* <div> */}
            {items.map((item, idx) => (
                <Card key={idx} className="mb-3">
                    <Card.Header className="d-flex justify-content-between align-items-center">
                        <span className="fw-bold">{item.name}</span>

                        <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => removeItem(idx)}
                        >
                            <TrashFill size={18} />
                        </Button>
                    </Card.Header>
                    <Card.Body>
                        <Row className="g-2 align-items-end">
                            <Col xs={4} md={3}>
                                <Form.Label className="small">Largura (m)</Form.Label>
                                <Form.Control
                                    type="number"
                                    step="0.1"
                                    min="1"
                                    value={item.width}
                                    onChange={(e) =>
                                        updateItem(idx, "width", parseFloat(e.target.value) || 1)
                                    }
                                />
                            </Col>
                            <Col xs={4} md={3}>
                                <Form.Label className="small">Altura (m)</Form.Label>
                                <Form.Control
                                    type="number"
                                    step="0.1"
                                    min="1"
                                    value={item.height}
                                    onChange={(e) =>
                                        updateItem(idx, "height", parseFloat(e.target.value) || 1)
                                    }
                                />
                            </Col>
                            <Col xs={4} md={3}>
                                <Form.Label className="small">Qtd</Form.Label>
                                <Form.Control
                                    type="number"
                                    min="1"
                                    value={item.quantity}
                                    onChange={(e) =>
                                        updateItem(idx, "quantity", parseInt(e.target.value) || 1)
                                    }
                                />
                            </Col>
                            <Col xs={2} md={2} className="text-center">

                            </Col>
                        </Row>
                        {calculated[idx] && (
                            <div className="mt-3">
                                <Table size="sm" bordered>
                                    <thead style={{ background: "#f0f0f0" }}>
                                        <tr>
                                            <th>Material</th>
                                            <th>Qtd</th>
                                            <th>Unid.</th>
                                            <th>Preço Unit.</th>
                                            <th>Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {calculated[idx].materials.map(
                                            (m: any, mi: number) => (
                                                <tr key={mi}>
                                                    <td>{m.materialName}</td>
                                                    <td>{m.quantity}</td>
                                                    <td>{m.unit}</td>
                                                    <td>R$ {formatMoney(m.unitPrice)}</td>
                                                    <td>R$ {formatMoney(m.total)}</td>
                                                </tr>
                                            )
                                        )}
                                    </tbody>
                                    <tfoot>
                                        <tr className="fw-bold">
                                            <td colSpan={4} className="text-end">
                                                Subtotal:
                                            </td>
                                            <td>R$ {formatMoney(calculated[idx].subtotal)}</td>
                                        </tr>
                                    </tfoot>
                                </Table>
                            </div>
                        )}
                    </Card.Body>
                </Card>
            ))}
        </div>
    );
}