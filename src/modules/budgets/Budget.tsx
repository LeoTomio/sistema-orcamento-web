import { Table, Button } from "react-bootstrap";
import budgetService from "./budgetService";
import jsPDF from "jspdf";


export default function Budget() {
    const budgets = budgetService.getAll();

    const generatePDF = (budget: any) => {
        const doc = new jsPDF();

        doc.text(`Cliente: ${budget.clientName}`, 10, 10);

        let y = 20;
        budget.items.forEach((item: any) => {
            doc.text(
                `${item.name} - ${item.quantity} x ${item.price}`,
                10,
                y
            );
            y += 10;
        });

        doc.text(`Total: R$ ${budget.total}`, 10, y + 10);

        doc.save(`orcamento-${budget.clientName}.pdf`);
    };

    return (
        <Table bordered>
            <thead>
                <tr>
                    <th>Cliente</th>
                    <th>Total</th>
                    <th>Ação</th>
                </tr>
            </thead>
            <tbody>
                {budgets.map(b => (
                    <tr key={b.id}>
                        <td>{b.clientName}</td>
                        <td>R$ {b.total}</td>
                        <td>
                            <Button size="sm" onClick={() => generatePDF(b)}>
                                Gerar PDF
                            </Button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </Table>
    );
}
