import { useEffect, useState } from "react";
import ClientService from "./Service";
import type { Client } from "./types";
import { Button, Card, Col, Row } from "react-bootstrap";
import { PencilFill, TrashFill } from "react-bootstrap-icons";
import PaginationComponent from "../../components/Pagination";
import ConfirmModal from "../../components/ConfirmModal";
import { toast } from "sonner";
import ClientModal from "./Modal";
import { formatDocument } from "../../utils/formaters";
import { useLoading } from "../../context/LoadingContext";
import { itemPerPageEnum } from "../../utils/enum";

function Clients() {
    const { startLoading, endLoading } = useLoading()
    const [clients, setClients] = useState<Client[]>([]);
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
    const [openModal, setOpenModal] = useState(false);
    const [openDeleteModal, setOpenDeleteModal] = useState(false);

    const [totalItems, setTotalItems] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        loadClients(currentPage);
    }, [currentPage]);

    const loadClients = async (page: number = 1) => {
        startLoading()
        try {

            const response = await ClientService.getAll(page);
            setClients(response.data);
            setTotalItems(response.total);
        } catch (error) {
            console.log('e->', error)
        } finally {
            endLoading()
        }
    };

    const handleDelete = async () => {
        if (!selectedClient) return;
        await ClientService.delete(selectedClient.id!);

        if (clients.length === 1 && currentPage > 1) {
            setCurrentPage(prev => prev - 1);
        } else {
            loadClients(currentPage);
        }

        setSelectedClient(null);
        setOpenDeleteModal(false);
        toast.success("Cliente excluído com sucesso!");
    };

    const handleEdit = (product: Client) => {
        setSelectedClient(product);
        setOpenModal(true);
    };

    return (
        <>
            <Card className="page-container">
                <Row className="align-items-center mb-4">
                    <Col xs={12} md={8}>
                        <div className="mb-3">
                            <h5 className="mb-1">Clientes</h5>
                            <small className="text-muted">
                                Gerencie os clientes cadastrados
                            </small>
                        </div>
                    </Col>
                    <Col xs={12} md={4} className="text-md-end">
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

                <Row xs={1} sm={2} md={3} lg={3} className="g-3">
                    {clients.length > 0 && clients.map((c) => (
                        <Col key={c.id}>
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
                                                <span>Excluir</span>
                                            </Button>

                                        </div>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
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

            <ClientModal
                show={openModal}
                onClose={() => { setOpenModal(false); setSelectedClient(null) }}
                selectedClient={selectedClient}
                onSuccess={() => {
                    loadClients(currentPage);
                    toast.success(
                        `Cliente ${selectedClient ? "alterado" : "adicionado"} com sucesso!`
                    );
                }}
            />

            <ConfirmModal
                show={openDeleteModal}
                title="Confirmar Exclusão"
                message={`Deseja excluir o produto "${selectedClient?.name}"?`}
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