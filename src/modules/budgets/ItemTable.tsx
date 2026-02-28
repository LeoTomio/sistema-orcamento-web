import { Button, Form, Table } from "react-bootstrap";
import { formatMoney } from "../../utils/formaters";
import type { BudgetItem } from "./types";

interface Props {
    items: BudgetItem[];
    onChangeItems: (items: BudgetItem[]) => void;
}

export default function BudgetItemTable({ items, onChangeItems }: Props) {

    const updateItem = (index: number, field: string, value: any) => {
        const updated = [...items];
        (updated[index] as any)[field] = Number(value);
        onChangeItems(updated);
    };

    const removeItem = (item: BudgetItem) => {
        const newItemsList = items.filter((i) => i.productId !== item.productId)
        onChangeItems(newItemsList);
    };

    return (
        <div style={{ maxHeight: "250px", overflowY: "auto" }}>
            <Table bordered>
                <thead>
                    <tr>
                        <th>Produto</th>
                        <th className="text-center">Preço (R$)</th>
                        <th className="text-center">Quantidade</th>
                        <th className="text-center">Sub-total (R$)</th>
                        <th className="text-center">Ação</th>
                    </tr>
                </thead>
                <tbody className="">
                    {items.map((item, index) => (
                        <tr key={index} >
                            <td className="align-content-center text-center">{item.name}</td>
                            <td className="align-content-center text-center">
                                <Form.Control
                                    type="number"
                                    value={item.price}
                                    onChange={(e) => updateItem(index, "price", e.target.value)}
                                />
                            </td>
                            <td className="align-content-center text-center">
                                <Form.Control
                                    type="number"
                                    value={item.quantity}
                                    onChange={(e) => updateItem(index, "quantity", e.target.value)}
                                />
                            </td>
                            <td className="align-content-center text-center">{formatMoney(item.price * item.quantity)}</td>
                            <td className="align-content-center text-center">
                                <Button
                                    variant="danger"
                                    size="sm"
                                    onClick={() => removeItem(item)}
                                >
                                    Excluir
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </div>
    );
}
