import { useEffect, useState } from "react";
import { Button, Card, Col, Row, Table } from "react-bootstrap";
import { FiletypePdf, JournalText, PencilFill, TrashFill, VectorPen } from "react-bootstrap-icons";
import { toast } from "sonner";
import ConfirmModal from "../../components/ConfirmModal";
import PaginationComponent from "../../components/Pagination";
import BudgetModal from "./Modal";
import BudgetService from "./Service";
import { SignatureModal } from "./SubscribeModal";
import type { Budget } from "./types";


export default function Budgets() {

    const [budgets, setBudgets] = useState<Budget[]>([]);
    const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);
    const [openModal, setOpenModal] = useState(false);
    const [openDeleteModal, setOpenDeleteModal] = useState(false);

    const [totalItems, setTotalItems] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);

    const [openSignatureModal, setOpenSignatureModal] = useState(false);

    useEffect(() => {
        loadBudgets(currentPage);
    }, [currentPage]);


    const loadBudgets = async (page: number) => {
        const response = await BudgetService.getAll({ page });
        setBudgets(response.data);
        setTotalItems(response.total);
    };

    const handleDelete = async () => {
        if (!selectedBudget) return;

        await BudgetService.delete(selectedBudget.id!);

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

    const handleDownloadPdf = async (budget: Budget) => {
        const blob = await BudgetService.generatePdf(budget.id!);

        const url = window.URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.download = `orcamento-${budget.client?.name}.pdf`;

        document.body.appendChild(link);
        link.click();

        link.remove();
        window.URL.revokeObjectURL(url);
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
                                    <td>{b.client?.name}</td>
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
                                                onClick={() => handleDownloadPdf(b)}
                                            />
                                            <div role="button" className="d-flex align-items-center gap-1" onClick={() => {
                                                setSelectedBudget(b);
                                                setOpenSignatureModal(true)
                                            }}>
                                                <JournalText color="#6f42c1" size={18} />
                                                <VectorPen color="#6f42c1" size={16} />
                                            </div>
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
                message={`Deseja excluir este orçamento?`}
                onConfirm={handleDelete}
                onCancel={() => {
                    setSelectedBudget(null);
                    setOpenDeleteModal(false);
                }}
            />
            <SignatureModal
                show={openSignatureModal}
                budgetId={selectedBudget?.id!}
                onClose={() => { setOpenSignatureModal(false) }}
            />
        </>
    );
}
