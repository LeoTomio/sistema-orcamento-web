import { useState } from "react";
import { Table, Button, Card } from "react-bootstrap";
import type { Product } from "./ProductType";
import ConfirmModal from "../../components/ConfirmModal";
import productService from "./productService";


function Products() {
    const [productToDelete, setProductToDelete] = useState<Product | null>(null);

    const products = productService.getAll();

    const handleDelete = () => {
        if (!productToDelete) return;

        productService.delete(productToDelete.id);
        setProductToDelete(null);
    };

    return (
        <>
            <Card className="p-3 mb-4">
                <h5>Produtos Cadastrados</h5>

                <Table bordered>
                    <thead>
                        <tr>
                            <th>Produto</th>
                            <th>Preço</th>
                            <th>Ação</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map((p) => (
                            <tr key={p.id}>
                                <td>{p.name}</td>
                                <td>R$ {p.price}</td>
                                <td>
                                    <Button
                                        variant="danger"
                                        size="sm"
                                        onClick={() => setProductToDelete(p)}
                                    >
                                        Excluir
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </Card>

            <ConfirmModal
                show={!!productToDelete}
                title="Confirmar Exclusão"
                message={`Deseja excluir o produto "${productToDelete?.name}"?`}
                onConfirm={handleDelete}
                onCancel={() => setProductToDelete(null)}
            />
        </>
    );
}
export default Products