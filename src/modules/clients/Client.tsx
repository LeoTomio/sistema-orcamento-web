import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Button, Card, Col, Row } from "react-bootstrap";
import { PencilFill, TrashFill } from "react-bootstrap-icons";
import { toast } from "sonner";
import ConfirmModal from "../../components/ConfirmModal";
import PaginationComponent from "../../components/Pagination";
import { cacheTime, itemPerPageEnum } from "../../utils/enum";
import { formatDocument } from "../../utils/formaters";
import ClientModal from "./Modal";
import clientService from "./Service";
import type { Client } from "./types";

function Clients() {
    const queryClient = useQueryClient();
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
    const [openModal, setOpenModal] = useState(false);
    const [openDeleteModal, setOpenDeleteModal] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);

    const { data, isLoading } = useQuery({
        queryKey: ["clients", currentPage],
        queryFn: () => clientService.getAll(currentPage),
        staleTime: cacheTime.fiveMinutes,
        refetchOnWindowFocus: false
    })

    const clients = data?.data || []
    const totalItems = data?.total || 0


    const deleteMutation = useMutation({
        mutationFn: (id: string) => clientService.delete(id),
        onSuccess: () => {
            toast.success("Cliente excluído com sucesso!");
            if (clients.length === 1 && currentPage > 1) {
                setCurrentPage(prev => prev - 1);
            }

            queryClient.invalidateQueries({ queryKey: ["clients"] });
            setOpenDeleteModal(false)
        },
    })
    const handleDelete = async () => {
        if (!selectedClient) return;

        await deleteMutation.mutateAsync(selectedClient.id!);

    };

    const handleEdit = (client: Client) => {
        setSelectedClient(client);
        setOpenModal(true);
    };
    

    return (
        <>
            <Row className="d-flex justify-content-between align-items-center mb-4">
                <Col xs={6} md={10}>
                    <h2 className="mb-1">Clientes</h2>
                </Col>
                <Col xs={6} md={2} className="text-md-end">
                    <Button
                        className="submitButton w-100"
                        onClick={() => {
                            setSelectedClient(null);
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
                    {!isLoading && clients.length > 0 && clients.map((c) => (
                        <Col xs={12} md={6} lg={3} key={c.id}>
                            <Card className="h-100 internal-card">
                                <Card.Body className="d-flex flex-column">
                                    <Card.Title className="fw-bold">{c.name}</Card.Title>
                                    <Card.Text className="text-muted mb-3">
                                        <strong>CPF/CNPJ:</strong> {formatDocument(c.document)}
                                    </Card.Text>
                                    <div className="mt-auto">
                                        <div className="actions-container">
                                            <Button
                                                variant="outline-success"
                                                size="sm"
                                                className="action-btn"
                                                onClick={() => handleEdit(c)}
                                            >
                                                <PencilFill size={14} />
                                                <span>Editar</span>
                                            </Button>
                                            <Button
                                                variant="outline-danger"
                                                size="sm"
                                                className="action-btn"
                                                onClick={() => {
                                                    setSelectedClient(c);
                                                    setOpenDeleteModal(true);
                                                }}
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
                    {!isLoading && clients.length === 0 && (
                        <Col xs={12}>
                            <Card className="border-0 shadow-sm rounded-4">
                                <Card.Body className="text-center py-5 text-muted">
                                    Nenhum cliente encontrado.
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
                        itemPerPage={itemPerPageEnum.client}
                    />
                </div>
            </Card>
            {openModal &&
                <ClientModal
                    show={openModal}
                    onClose={() => { setOpenModal(false); setSelectedClient(null) }}
                    selectedClient={selectedClient}
                    onSuccess={() => {
                        toast.success(`Cliente ${selectedClient ? "alterado" : "adicionado"} com sucesso!`);
                        queryClient.invalidateQueries({ queryKey: ["clients"] });
                    }}
                />}

            <ConfirmModal
                show={openDeleteModal}
                title="Confirmar Exclusão"
                message={`Deseja excluir o cliente "${selectedClient?.name}"?`}
                onConfirm={handleDelete}
                onCancel={() => {
                    setSelectedClient(null);
                    setOpenDeleteModal(false);
                }}
            />
        </>
    );
}

export default Clients