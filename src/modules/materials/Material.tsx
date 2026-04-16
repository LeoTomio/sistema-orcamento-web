import { useState } from "react";
import { Button, Card, Col, Row } from "react-bootstrap";
import { PencilFill, TrashFill } from "react-bootstrap-icons";
import { toast } from "sonner";
import ConfirmModal from "../../components/ConfirmModal";
import PaginationComponent from "../../components/Pagination";
import MaterialModal from "./Modal";
import materialService from "./Service";
import type { MaterialForm } from "./types";
import { formatMoney } from "../../utils/formaters";
import { cacheTime, itemPerPageEnum } from "../../utils/enum";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

function Materials() {
    const queryClient = useQueryClient();

    const [selectedMaterial, setSelectedMaterial] = useState<MaterialForm | null>(null);
    const [openModal, setOpenModal] = useState(false);
    const [openDeleteModal, setOpenDeleteModal] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);

    const { data, isLoading } = useQuery({
        queryKey: ["materials", currentPage],
        queryFn: () => materialService.getAll(currentPage),
        staleTime: cacheTime.fiveMinutes,
        refetchOnWindowFocus: false,
    });

    const materials = data?.data || [];
    const totalItems = data?.total || 0;



    const deleteMutation = useMutation({
        mutationFn: (id: string) => materialService.delete(id),
        onSuccess: () => {
            toast.success("Material excluído com sucesso!");

            queryClient.invalidateQueries({ queryKey: ["materials"] });

            setTimeout(() => {
                if (materials.length === 1 && currentPage > 1) {
                    setCurrentPage(prev => prev - 1);
                }
            });
        },
        onSettled: () => {
            setOpenDeleteModal(false);
        }
    });

    const handleDelete = async () => {
        if (!selectedMaterial) return;

        await deleteMutation.mutateAsync(selectedMaterial.id!);
    };


    const handleEdit = (material: MaterialForm) => {
        setSelectedMaterial(material);
        setOpenModal(true);
    };

    return (
        <>
            <Row className="d-flex justify-content-between align-items-center mb-4">
                <Col xs={6} md={10}>
                    <h2 className="mb-1">Materiais</h2>
                </Col>
                <Col xs={6} md={2} className="text-md-end">
                    <Button
                        className="submitButton w-100"
                        onClick={() => {
                            setSelectedMaterial(null);
                            setOpenModal(true);
                        }}
                    >
                        Adicionar
                    </Button>
                </Col>
            </Row>
            <Card className="page-container">
                <Row className="g-3">
                    {isLoading &&
                        <Col xs={12}>
                            <Card className="border-0 shadow-sm rounded-4">
                                <Card.Body className="text-center py-5 text-muted">
                                    Carregando...
                                </Card.Body>
                            </Card>
                        </Col>
                    }

                    {!isLoading && materials.length > 0 && materials.map((p: MaterialForm) => (
                        <Col xs={12} md={4} lg={3} key={p.id}>
                            <Card className="h-100 internal-card">
                                <Card.Body className="d-flex flex-column">
                                    <Card.Title className="fw-bold">{p.name}</Card.Title>

                                    <Card.Text className="text-muted mb-3">
                                        <strong>Preço:</strong> R$ {formatMoney(Number(p.price))}
                                    </Card.Text>

                                    <div className="mt-auto">
                                        <div className="actions-container">
                                            <Button
                                                variant="outline-success"
                                                size="sm"
                                                className="action-btn"
                                                onClick={() => handleEdit(p)}
                                            >
                                                <PencilFill size={14} />
                                                <span>Editar</span>
                                            </Button>

                                            <Button
                                                variant="outline-danger"
                                                size="sm"
                                                className="action-btn"
                                                disabled={deleteMutation.isPending}
                                                onClick={() => {
                                                    setSelectedMaterial(p);
                                                    setOpenDeleteModal(true);
                                                }}
                                            >
                                                <TrashFill size={14} />
                                                <span>
                                                    {deleteMutation.isPending ? "Excluindo..." : "Excluir"}
                                                </span>
                                            </Button>
                                        </div>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}

                    {!isLoading && materials.length === 0 && (
                        <Col xs={12}>
                            <Card className="border-0 shadow-sm rounded-4">
                                <Card.Body className="text-center py-5 text-muted">
                                    Nenhum produto encontrado.
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
                        itemPerPage={itemPerPageEnum.material}
                    />
                </div>
            </Card>
            {openModal &&
                <MaterialModal
                    show={openModal}
                    onClose={() => {
                        setOpenModal(false);
                        setSelectedMaterial(null);
                    }}
                    selectedMaterial={selectedMaterial}
                    onSuccess={() => {
                        toast.success(`Material ${selectedMaterial ? "alterado" : "adicionado"} com sucesso!`);
                        queryClient.invalidateQueries({ queryKey: ["materials"] });
                    }}
                />
            }

            <ConfirmModal
                show={openDeleteModal}
                title="Confirmar Exclusão"
                message={`Deseja excluir o produto "${selectedMaterial?.name}"?`}
                onConfirm={handleDelete}
                onCancel={() => {
                    setOpenDeleteModal(false);
                    setSelectedMaterial(null);
                }}
            />
        </>
    );
}

export default Materials;