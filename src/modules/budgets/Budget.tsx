import { useEffect, useState } from "react";
import { Button, Card, Col, Row } from "react-bootstrap";
import { FiletypePdf, PencilFill, TrashFill, VectorPen } from "react-bootstrap-icons";
import { toast } from "sonner";
import ConfirmModal from "../../components/ConfirmModal";
import PaginationComponent from "../../components/Pagination";
import { useLoading } from "../../context/LoadingContext";
import "../../styles/budget.css";
import { itemPerPageEnum } from '../../utils/enum';
import BudgetModal from "./Modal";
import BudgetService from "./Service";
import { SignatureModal } from "./SubscribeModal";
import type { Budget } from "./types";
import { Browser } from "@capacitor/browser";
import { Capacitor } from "@capacitor/core";
import { formatMoney } from "../../utils/formaters";

export default function Budgets() {
  const { endLoading, startLoading } = useLoading()
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
    try {
      startLoading()
      const response = await BudgetService.getAll({ page });
      console.log(response)
      setBudgets(response.data);
      setTotalItems(response.total);
    } catch (error) {
      console.log('e->', error)
    } finally {
      endLoading()
    }
  };

  const handleDelete = async () => {
    if (!selectedBudget) return;

    await BudgetService.delete(selectedBudget.id!);

    if (budgets.length === 1 && currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
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
    const fileName = `orcamento-${budget.client?.name}.pdf`;

    // 👉 Se for mobile (Capacitor)
    if (Capacitor.isNativePlatform()) {
      // Abre o PDF no navegador externo
      await Browser.open({
        url,
      });
      return;
    }

    // 👉 WEB (download normal)
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;

    document.body.appendChild(link);
    link.click();
    link.remove();

    window.URL.revokeObjectURL(url);
  };


  const openDelete = (budget: Budget) => {
    setSelectedBudget(budget);
    setOpenDeleteModal(true);
  };

  const openSignature = (budget: Budget) => {
    setSelectedBudget(budget);
    setOpenSignatureModal(true);
  };

  return (
    <>
      <Card className="page-container">
        <Row className="align-items-center mb-4">
          <Col xs={12} md={8}>
            <div className="mb-3">
              <h5 className="mb-1">Orçamentos</h5>
              <small className="text-muted">
                Gerencie os orçamentos cadastrados
              </small>
            </div>
          </Col>

          <Col xs={12} md={4} className="text-md-end">
            <Button
              className="submitButton w-100"
              onClick={() => {
                setSelectedBudget(null);
                setOpenModal(true);
              }}
            >
              Adicionar
            </Button>
          </Col>
        </Row>

        <Row className="g-4">
          {budgets.length > 0 ? (
            budgets.map((b) => (
              <Col key={b.id} xs={12} md={6} xl={4}>
                <Card className="h-100 border-0 internal-card">
                  <Card.Body className="p-3 p-md-4 d-flex flex-column">
                    <div className="mb-3">
                      <div className="budget-label">CLIENTE</div>
                      <div className="fw-semibold fs-6">
                        {b.client?.name || "-"}
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="budget-label">TOTAL</div>
                      <div className="fw-bold fs-4 text-success">
                        R$ {formatMoney(b.total)}
                      </div>
                    </div>

                    <div className="mt-auto">
                      <div className="actions-container">
                        <Button
                          variant="outline-success"
                          size="sm"
                          className="action-btn"
                          onClick={() => handleEdit(b)}
                        >
                          <PencilFill size={14} />
                          <span>Editar</span>
                        </Button>

                        <Button
                          variant="outline-primary"
                          size="sm"
                          className="action-btn"
                          onClick={() => handleDownloadPdf(b)}
                        >
                          <FiletypePdf size={14} />
                          <span>PDF</span>
                        </Button>

                        <Button
                          variant="outline-secondary"
                          size="sm"
                          className="action-btn"
                          onClick={() => openSignature(b)}
                        >
                          <VectorPen size={13} />
                          <span>Assinar</span>
                        </Button>

                        <Button
                          variant="outline-danger"
                          size="sm"
                          className="action-btn"
                          onClick={() => openDelete(b)}
                        >
                          <TrashFill size={14} />
                          <span>Excluir</span>
                        </Button>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))
          ) : (
            <Col xs={12}>
              <Card className="border-0 shadow-sm rounded-4">
                <Card.Body className="text-center py-5 text-muted">
                  Nenhum orçamento encontrado.
                </Card.Body>
              </Card>
            </Col>
          )}
        </Row>

        <div className="mt-4">
          <PaginationComponent
            currentPage={currentPage}
            totalItems={totalItems}
            onPageChange={setCurrentPage}
            itemPerPage={itemPerPageEnum.budget}
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
        message="Deseja excluir este orçamento?"
        onConfirm={handleDelete}
        onCancel={() => {
          setSelectedBudget(null);
          setOpenDeleteModal(false);
        }}
      />

      <SignatureModal
        show={openSignatureModal}
        budgetId={selectedBudget?.id!}
        onClose={() => setOpenSignatureModal(false)}
      />
    </>
  );
}