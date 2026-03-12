import { useEffect, useState } from "react";
import ClientService from "./Service";
import type { Client } from "./types";
import { Button, Card, Col, Row, Table } from "react-bootstrap";
import { PencilFill, TrashFill } from "react-bootstrap-icons";
import PaginationComponent from "../../components/Pagination";
import ConfirmModal from "../../components/ConfirmModal";
import { toast } from "sonner";
import ClientModal from "./Modal";
import { formatDocument } from "../../utils/formaters";

function Clients() {

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
        const response = await ClientService.getAll(page);
        setClients(response.data);
        setTotalItems(response.total);
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
            <Card className="p-3 mb-4">
                <Row className="align-items-center mb-4">
                    <Col sm={8}>
                        <h5 className="mb-0">Clientes Cadastrados</h5>
                    </Col>

                    <Col sm={4} className="text-end">
                        <Button
                            className="submitButton"
                            onClick={() => {
                                setSelectedClient(null);
                                setOpenModal(true);
                            }}
                        >
                            Adicionar
                        </Button>
                    </Col>
                </Row>

                <div className="table-responsive">
                    <Table bordered hover className="align-middle">
                        <thead>
                            <tr>
                                <th>Cliente</th>
                                <th className="text-center" style={{ width: "20%", whiteSpace: "nowrap" }}>CPF/CNPJ</th>
                                <th className="text-center" style={{ width: "10%", whiteSpace: "nowrap" }}>Ações</th>
                            </tr>
                        </thead>

                        <tbody>
                            {clients.length > 0 && clients.map((c) => (
                                <tr key={c.id}>
                                    <td>{c.name}</td>
                                    <td className="text-center">
                                        {formatDocument(c.document)}
                                    </td>
                                    <td className="text-center">
                                        <div className="d-flex justify-content-center gap-2">
                                            <PencilFill
                                                size="1.5rem"
                                                color="#87d86e"
                                                role="button"
                                                onClick={() => handleEdit(c)}
                                            />

                                            <TrashFill
                                                size="1.5rem"
                                                color="red"
                                                role="button"
                                                onClick={() => {
                                                    setSelectedClient(c);
                                                    setOpenDeleteModal(true);
                                                }}
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

            <ClientModal
                show={openModal}
                onClose={() => setOpenModal(false)}
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