import jsPDF from "jspdf";
import { useEffect, useState } from "react";
import { Button, Card, Col, Row, Table } from "react-bootstrap";
import { FiletypePdf, PencilFill, TrashFill } from "react-bootstrap-icons";
import { toast } from "sonner";
import ConfirmModal from "../../components/ConfirmModal";
import PaginationComponent from "../../components/Pagination";
import BudgetModal from "./BudgetModal";
import budgetService from "./budgetService";
import type { Budget } from "./BudgetType";


export default function Budgets() {

    const [budgets, setBudgets] = useState<Budget[]>([]);
    const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);
    const [openModal, setOpenModal] = useState(false);
    const [openDeleteModal, setOpenDeleteModal] = useState(false);

    const [totalItems, setTotalItems] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);

    const itemsPerPage = 5;

    useEffect(() => {
        loadBudgets(currentPage);
    }, [currentPage]);


    const loadBudgets = async (page: number) => {
        const response = await budgetService.getAll({ page, limit: itemsPerPage });

        setBudgets(response.data);
        setTotalItems(response.total);
    };

    const handleDelete = async () => {
        if (!selectedBudget) return;

        await budgetService.delete(selectedBudget.id!);

        // Se excluir o último item da página
        if (budgets.length === 1 && currentPage > 1) {
            setCurrentPage(prev => prev - 1);
        } else {
            loadBudgets(currentPage);
        }

        setSelectedBudget(null);
        setOpenDeleteModal(false);
        toast.success("Orçamento excluído com sucesso!");
    };

    const handleEdit = (budget: Budget) => {
        setSelectedBudget(budget);
        setOpenModal(true);
    };

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
        <>
            <Card className="p-3 mb-4">
                <Row className="align-items-center mb-4">
                    <Col sm={8}>
                        <h5 className="mb-0">Orçamentos</h5>
                    </Col>

                    <Col sm={4} className="text-end">
                        <Button className="submitButton"
                            onClick={() => {
                                setSelectedBudget(null);
                                setOpenModal(true);
                            }}
                        >
                            Adicionar
                        </Button>
                    </Col>
                </Row>
                <div className="table-responsive">
                    <Table bordered>
                        <thead>
                            <tr>
                                <th>Cliente</th>
                                <th className="text-center" style={{ width: "20%", whiteSpace: "nowrap" }}>Total (R$)</th>
                                <th className="text-center" style={{ width: "20%", whiteSpace: "nowrap" }}>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {budgets.map(b => (
                                <tr key={b.id}>
                                    <td>{b.clientName}</td>
                                    <td className="text-center">{Number(b.total).toFixed(2)}</td>
                                    <td className="text-center">
                                        <div className="d-flex justify-content-center gap-2 px-2">
                                            <PencilFill
                                                size="1.5rem"
                                                color="#87d86e"
                                                role="button"
                                                onClick={() => handleEdit(b)}
                                            />

                                            <TrashFill
                                                size="1.5rem"
                                                color="red"
                                                role="button"
                                                onClick={() => {
                                                    setSelectedBudget(b);
                                                    setOpenDeleteModal(true);
                                                }}
                                            />
                                            <FiletypePdf
                                                size="1.5rem"
                                                color="#2d4a6e"
                                                role="button"
                                                onClick={() => generatePDF(b)}
                                            />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                    <PaginationComponent
                        currentPage={currentPage}
                        totalItems={totalItems}
                        onPageChange={setCurrentPage}
                    />
                </div>
            </Card>

            <BudgetModal
                show={openModal}
                onClose={() => setOpenModal(false)}
                selectedBudget={selectedBudget}
                onSuccess={() => {
                    loadBudgets(currentPage);
                    toast.success(
                        `Orçamento ${selectedBudget ? "alterado" : "adicionado"} com sucesso!`
                    );
                }}
            />

            <ConfirmModal
                show={openDeleteModal}
                title="Confirmar Exclusão"
                message={`Deseja excluir o orçamento "${selectedBudget?.clientName}"?`}
                onConfirm={handleDelete}
                onCancel={() => {
                    setSelectedBudget(null);
                    setOpenDeleteModal(false);
                }}
            />
        </>
    );
}
