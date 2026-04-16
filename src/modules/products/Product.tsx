import { useState } from "react";
import { Button, Card, Col, Row } from "react-bootstrap";
import { PencilFill, TrashFill } from "react-bootstrap-icons";
import { toast } from "sonner";
import ConfirmModal from "../../components/ConfirmModal";
import PaginationComponent from "../../components/Pagination";
import ProductModal from "./Modal";
import productService from "./Service";
import type { Product, ProductForm } from "./types";
import { formatMoney } from "../../utils/formaters";
import { cacheTime, itemPerPageEnum } from "../../utils/enum";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

function Products() {
    const queryClient = useQueryClient();

    const [selectedProduct, setSelectedProduct] = useState<ProductForm | null>(null);
    const [openModal, setOpenModal] = useState(false);
    const [openDeleteModal, setOpenDeleteModal] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);

    const { data, isLoading } = useQuery({
        queryKey: ["products", currentPage],
        queryFn: () => productService.getAll(currentPage),
        staleTime: cacheTime.fiveMinutes,
        refetchOnWindowFocus: false,
    });

    const products = data?.data || [];
    const totalItems = data?.total || 0;

    const deleteMutation = useMutation({
        mutationFn: (id: string) => productService.delete(id),
        onSuccess: () => {
            toast.success("Produto excluído com sucesso!");

            queryClient.invalidateQueries({ queryKey: ["products"] });

            setTimeout(() => {
                if (products.length === 1 && currentPage > 1) {
                    setCurrentPage(prev => prev - 1);
                }
            });
        },
        onSettled: () => {
            setOpenDeleteModal(false);
        }
    });

    const handleDelete = async () => {
        if (!selectedProduct) return;

        await deleteMutation.mutateAsync(selectedProduct.id!);
    };

    const handleEdit = (product: ProductForm) => {
        setSelectedProduct(product);
        setOpenModal(true);
    };

    return (
        <>
            <Row className="d-flex justify-content-between align-items-center mb-4">
                <Col xs={6} md={10}>
                    <h2 className="mb-1">Produtos</h2>
                </Col>
                <Col xs={6} md={2} className="text-md-end">
                    <Button
                        className="submitButton w-100"
                        onClick={() => {
                            setSelectedProduct(null);
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

                    {!isLoading && products.length > 0 && products.map((p: Product) => (
                        <Col xs={12} md={4} lg={3} key={p.id}>
                            <Card className="h-100 internal-card">
                                <Card.Body className="d-flex flex-column">
                                    <Card.Title className="fw-bold">{p.name}</Card.Title>

                                    <Card.Text className="text-muted mb-3">
                                        <strong>Preço:</strong> R$ {formatMoney(p.price)}
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
                                                    setSelectedProduct(p);
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

                    {!isLoading && products.length === 0 && (
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
                        itemPerPage={itemPerPageEnum.product}
                    />
                </div>
            </Card>
            {openModal &&
                <ProductModal
                    show={openModal}
                    onClose={() => {
                        setOpenModal(false);
                        setSelectedProduct(null);
                    }}
                    selectedProduct={selectedProduct}
                    onSuccess={() => {
                        toast.success(`Produto ${selectedProduct ? "alterado" : "adicionado"} com sucesso!`);
                        queryClient.invalidateQueries({ queryKey: ["products"] });
                    }}
                />}

            <ConfirmModal
                show={openDeleteModal}
                title="Confirmar Exclusão"
                message={`Deseja excluir o produto "${selectedProduct?.name}"?`}
                onConfirm={handleDelete}
                onCancel={() => {
                    setOpenDeleteModal(false);
                    setSelectedProduct(null);
                }}
            />
        </>
    );
}

export default Products;