import { Table, Button, Form } from "react-bootstrap";
import type { BudgetItem } from "./BudgetType";

interface Props {
    items: BudgetItem[];
    setItems: React.Dispatch<React.SetStateAction<BudgetItem[]>>;
}

export default function BudgetItemTable({ items, setItems }: Props) {

    const updateItem = (index: number, field: string, value: any) => {
        const updated = [...items];
        (updated[index] as any)[field] = value;
        setItems(updated);
    };

    const removeItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };

    return (
        <Table bordered>
            <thead>
                <tr>
                    <th>Produto</th>
                    <th>Preço</th>
                    <th>Quantidade</th>
                    <th>Ação</th>
                </tr>
            </thead>
            <tbody>
                {items.map((item, index) => (
                    <tr key={index}>
                        <td>{item.name}</td>
                        <td>
                            <Form.Control
                                type="number"
                                value={item.price}
                                onChange={(e) =>
                                    updateItem(index, "price", Number(e.target.value))
                                }
                            />
                        </td>
                        <td>
                            <Form.Control
                                type="number"
                                value={item.quantity}
                                onChange={(e) =>
                                    updateItem(index, "quantity", Number(e.target.value))
                                }
                            />
                        </td>
                        <td>
                            <Button
                                variant="danger"
                                size="sm"
                                onClick={() => removeItem(index)}
                            >
                                Excluir
                            </Button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </Table>
    );
}
