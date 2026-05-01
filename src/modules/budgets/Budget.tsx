import { Browser } from "@capacitor/browser";
import { Capacitor } from "@capacitor/core";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Button, Card, Col, Row } from "react-bootstrap";
import { FiletypePdf, PencilFill, TrashFill, VectorPen } from "react-bootstrap-icons";
import { toast } from "sonner";
import ConfirmModal from "../../components/ConfirmModal";
import PaginationComponent from "../../components/Pagination";
import { useAuth } from "../../context/AuthContext";
import "../../styles/budget.css";
import { cacheTime, itemPerPageEnum } from '../../utils/enum';
import { formatMoney } from "../../utils/formaters";
import BudgetModal from "./Modal";
import budgetService from "./Service";
import { SignatureModal } from "./SubscribeModal";
import type { Budget } from "./types";

export default function Budgets() {
  const queryClient = useQueryClient();
  const { user } = useAuth()
  const [selectedBudget, setSelectedBudget] = useState<string | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [openSignatureModal, setOpenSignatureModal] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["budgets", user?.id, currentPage],
    queryFn: () => budgetService.getAll(currentPage),
    staleTime: cacheTime.fiveMinutes,
    refetchOnWindowFocus: false,
    enabled: !!user?.id
  })

  const budgets = data?.data || []
  const totalItems = data?.total || 0


  const deleteMutation = useMutation({
    mutationFn: (id: string) => budgetService.delete(id),
    onSuccess: () => {
      toast.success("Orçamento excluído com sucesso!");

      if (budgets.length === 1 && currentPage > 1) {
        setCurrentPage((prev) => prev - 1);
      }

      queryClient.invalidateQueries({ queryKey: ["budgets", user?.id] });
    }
  })


  const handleDelete = async () => {
    if (!selectedBudget) return;

    deleteMutation.mutateAsync(selectedBudget!)
    queryClient.invalidateQueries({ queryKey: ["dashboard", user?.id] });
    setOpenDeleteModal(false)
  };

  const handleEdit = (id: string) => {
    setSelectedBudget(id);
    setOpenModal(true);
  };

  const handleDownloadPdf = async (budget: Budget) => {
    const blob = await budgetService.generatePdf(budget.id!);

    const url = window.URL.createObjectURL(blob);
    const fileName = `orcamento-${budget.client?.name}.pdf`;

    // 👉 Se for mobile (Capacitor)
    if (Capacitor.isNativePlatform()) {
      // Abre o PDF no navegador externo
      await Browser.open({ url });
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


  const openDelete = (id: string) => {
    setSelectedBudget(id);
    setOpenDeleteModal(true);
  };

  const openSignature = (id: string) => {
    setSelectedBudget(id);
    setOpenSignatureModal(true);
  };

  return (
    <>

      <Row className="d-flex justify-content-between align-items-center mb-4">
        <Col xs={6} md={10}>
          <h2 className="mb-1">Orçamentos</h2>
        </Col>
        <Col xs={6} md={2} className="text-md-end">
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
      <Card className="page-container">
        <Row>
          {isLoading &&
            <Col xs={12}>
              <Card className="border-0 shadow-sm rounded-4">
                <Card.Body className="text-center py-5 text-muted">
                  Carregando...
                </Card.Body>
              </Card>
            </Col>
          }
          {!isLoading && budgets.length > 0 && budgets.map((b) => (
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
                        onClick={() => handleEdit(b.id!)}
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
                        onClick={() => openSignature(b.id!)}
                      >
                        <VectorPen size={13} />
                        <span>Assinar</span>
                      </Button>

                      <Button
                        variant="outline-danger"
                        size="sm"
                        className="action-btn"
                        onClick={() => openDelete(b.id!)}
                      >
                        <TrashFill size={14} />
                        {deleteMutation.isPending ? "Excluindo..." : "Excluir"}
                      </Button>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}

          {!isLoading && budgets.length === 0 && (
            <Col xs={12}>
              <Card className="border-0 shadow-sm rounded-4">
                <Card.Body className="text-center py-5 text-muted">
                  Nenhum orçamento encontrado.
                </Card.Body>
              </Card>
            </Col>
          )}
        </Row>
      </Card>

      <div className="mt-4">
        <PaginationComponent
          currentPage={currentPage}
          totalItems={totalItems}
          onPageChange={setCurrentPage}
          itemPerPage={itemPerPageEnum.budget}
        />
      </div>

      {openModal &&
        <BudgetModal
          show={openModal}
          onClose={() => setOpenModal(false)}
          selectedBudget={selectedBudget}
          onSuccess={() => {
            toast.success(`Orçamento ${selectedBudget ? "alterado" : "adicionado"} com sucesso!`);
            queryClient.invalidateQueries({ queryKey: ["budgets", user?.id] });
            queryClient.invalidateQueries({ queryKey: ["dashboard", user?.id] });
          }}
        />
      }
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
        budgetId={selectedBudget!}
        onClose={() => setOpenSignatureModal(false)}
      />
    </>
  );
}