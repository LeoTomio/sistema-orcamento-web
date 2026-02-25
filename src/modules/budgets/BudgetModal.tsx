import { useEffect, useState, type ChangeEvent } from "react";
import { Button, Col, Form, Modal, Row, Table } from "react-bootstrap";
import { Plus } from "react-bootstrap-icons";
import { toast } from "sonner";
import { v4 as uuid } from "uuid";
import { useLoading } from "../../context/LoadingContext";
import { formatMoney } from "../../utils/formaters";
import productService from "../products/productService";
import type { Product } from "../products/ProductType";
import BudgetItemTable from "./BudgeItemTable";
import budgetService from "./budgetService";
import type { Budget } from "./BudgetType";
import ProductModal from "../products/ProductModal";

interface Props {
  show: boolean;
  onClose: () => void;
  selectedBudget: Budget | null
  onSuccess: () => void;
}

export default function BudgetModal({ show, onClose, selectedBudget, onSuccess }: Props) {
  const { endLoading, startLoading } = useLoading();
  const [formData, setFormData] = useState<Budget>({
    clientName: "",
    items: [],
    total: 0,
  })
  const [products, setProducts] = useState<Product[]>([]);
  const [openProductModal, setOpenProductModal] = useState(false);

  const availableProducts = products.filter(
    p => !formData.items.some(i => i.productId === p.id)
  );

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    const response = await productService.getToSelect();

    setProducts(response);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { clientName, items } = formData
    if (!clientName) {
      toast.warning('Campo cliente é obrigatório')
      return
    }
    if (items.length == 0) {
      toast.warning("É necessario ter ao menos 1 item")
      return
    }
    formData.total = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    try {
      startLoading()
      if (selectedBudget) {
        budgetService.update(formData)
      } else {
        budgetService.create({
          ...formData,
          id: uuid(),
        });
      }
      onSuccess()
      clearForm()
      handleClose()
    } catch (error) {
      console.log('erro ->', error)
    } finally {
      endLoading()
    }
  };
  const handleClose = () => {
    onClose();
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: name === "price" ? Number(value) : value
    }));
  };

  useEffect(() => {
    if (selectedBudget) {
      setFormData(selectedBudget);
    } else {
      clearForm()
    }
  }, [selectedBudget]);

  const handleAddProduct = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    setFormData(prev => ({
      ...prev,
      items: [
        ...prev.items,
        {
          productId: product.id!,
          name: product.name,
          price: product.price,
          quantity: 1
        }
      ]
    }));
  };

  const clearForm = () => {
    setFormData({
      clientName: "",
      items: [],
      total: 0,
    })
  }

  return (
    <>
      <Modal show={show} onHide={onClose} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Novo Orçamento</Modal.Title>
        </Modal.Header>

        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Nome do Cliente</Form.Label>
              <Form.Control
                name="clientName"
                value={formData.clientName}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Produto</Form.Label>
              <Row >
                <Col xs={10} md={11}>
                  <Form.Select onChange={(e) => handleAddProduct(e.target.value)}>
                    <option value="">Selecione</option>
                    {availableProducts.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </Form.Select>
                </Col>
                <Col xs={2} md={1} className="ps-0">
                  <Button   >
                    <Plus size="1.5rem" onClick={() => setOpenProductModal(true)} />
                  </Button>
                </Col>
              </Row>
            </Form.Group>

            <BudgetItemTable
              items={formData.items}
              onChangeItems={(items) =>
                setFormData(prev => ({
                  ...prev,
                  items
                }))
              }
            />

            <hr className="mt-5" />
            <Table>
              <thead>
                <th>Total</th>
                <td className="text-end"> R$ {formatMoney(formData.items.reduce((acc, item) => acc + (item.price * item.quantity), 0))}</td>
              </thead>
            </Table>
          </Modal.Body>

          <Modal.Footer>
            <Button variant="secondary" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              Salvar Orçamento
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <ProductModal
        show={openProductModal}
        onClose={() => setOpenProductModal(false)}
        selectedProduct={null}
        onSuccess={() => {
          loadProducts();
          toast.success(
            `Produto adicionado com sucesso!`
          );
        }}
      />
    </>
  );
}
