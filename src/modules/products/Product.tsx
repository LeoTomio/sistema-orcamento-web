import { useEffect, useState } from "react";
import { Button, Card, Col, Row, Table } from "react-bootstrap";
import { PencilFill, TrashFill } from 'react-bootstrap-icons';
import { toast } from "sonner";
import ConfirmModal from "../../components/ConfirmModal";
import PaginationComponent from "../../components/Pagination";
import ProductModal from "./Modal";
import productService from "./Service";
import type { Product } from "./types";

function Products() {

    const [products, setProducts] = useState<Product[]>([]);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [openModal, setOpenModal] = useState(false);
    const [openDeleteModal, setOpenDeleteModal] = useState(false);

    const [totalItems, setTotalItems] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        loadProducts(currentPage);
    }, [currentPage]);

    const loadProducts = async (page: number = 1) => {
        console.log(page)
        const response = await productService.getAll(page);

        setProducts(response.data);
        setTotalItems(response.total);
    };

    const handleDelete = async () => {
        if (!selectedProduct) return;

        await productService.delete(selectedProduct.id!);

        // Se excluir o último item da página
        if (products.length === 1 && currentPage > 1) {
            setCurrentPage(prev => prev - 1);
        } else {
            loadProducts(currentPage);
        }

        setSelectedProduct(null);
        setOpenDeleteModal(false);
        toast.success("Produto excluído com sucesso!");
    };

    const handleEdit = (product: Product) => {
        setSelectedProduct(product);
        setOpenModal(true);
    };

    return (
        <>
            <Card className="p-3 mb-4">
                <Row className="align-items-center mb-4">
                    <Col sm={8}>
                        <h5 className="mb-0">Produtos Cadastrados</h5>
                    </Col>

                    <Col sm={4} className="text-end">
                        <Button
                            className="submitButton"
                            onClick={() => {
                                setSelectedProduct(null);
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
                                <th>Produto</th>
                                <th className="text-center" style={{ width: "20%", whiteSpace: "nowrap" }}>Preço (R$)</th>
                                <th className="text-center" style={{ width: "10%", whiteSpace: "nowrap" }}>Ações</th>
                            </tr>
                        </thead>

                        <tbody>
                            {!!products.length && products.map((p) => (
                                <tr key={p.id}>
                                    <td>{p.name}</td>
                                    <td className="text-center">
                                        {Number(p.price).toFixed(2)}
                                    </td>
                                    <td className="text-center">
                                        <div className="d-flex justify-content-center gap-2">
                                            <PencilFill
                                                size="1.5rem"
                                                color="#87d86e"
                                                role="button"
                                                onClick={() => handleEdit(p)}
                                            />

                                            <TrashFill
                                                size="1.5rem"
                                                color="red"
                                                role="button"
                                                onClick={() => {
                                                    setSelectedProduct(p);
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

            <ProductModal
                show={openModal}
                onClose={() => setOpenModal(false)}
                selectedProduct={selectedProduct}
                onSuccess={() => {
                    loadProducts(currentPage);
                    toast.success(
                        `Produto ${selectedProduct ? "alterado" : "adicionado"} com sucesso!`
                    );
                }}
            />

            <ConfirmModal
                show={openDeleteModal}
                title="Confirmar Exclusão"
                message={`Deseja excluir o produto "${selectedProduct?.name}"?`}
                onConfirm={handleDelete}
                onCancel={() => {
                    setSelectedProduct(null);
                    setOpenDeleteModal(false);
                }}
            />
        </>
    );
}

export default Products;
