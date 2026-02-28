import { useEffect, useState, type ChangeEvent } from "react";
import { Button, Col, Form, Modal, Row, Table } from "react-bootstrap";
import { Plus } from "react-bootstrap-icons";
import { toast } from "sonner";
import { v4 as uuid } from "uuid";
import { useLoading } from "../../context/LoadingContext";
import { formatMoney } from "../../utils/formaters";
import productService from "../products/Service";
import type { Product } from "../products/types";
import BudgetItemTable from "./ItemTable";
import BudgetService from "./Service";
import type { Budget } from "./types";
import ProductModal from "../products/Modal";

interface Props {
  show: boolean;
  onClose: () => void;
  selectedBudget: Budget | null
  onSuccess: () => void;
}

export default function BudgetModal({ show, onClose, selectedBudget, onSuccess }: Props) {
  const { endLoading, startLoading } = useLoading();
  const [formData, setFormData] = useState<Budget>({
    client_name: "",
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
    const response = await productService.getAll();

    setProducts(response.data);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { client_name, items } = formData
    if (!client_name) {
      toast.warning('Campo cliente é obrigatório')
      return
    }
    if (client_name.length < 3) {
      toast.warning('Campo cliente deve ter ao menos 3 caracteres')
      return
    }
    if (items.length == 0) {
      toast.warning("É necessario ter ao menos 1 item")
      return
    }
    formData.total = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    try {
      startLoading()

      console.log('formdata', formData)
      if (selectedBudget) {
        await BudgetService.update(formData)
      } else {
        await BudgetService.create({
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
    if (!selectedBudget) {
      clearForm()
      return
    }

    const getBudget = async () => {
      try {
        const response = await BudgetService.getById(selectedBudget.id!)
        setFormData({
          id: response.id,
          client_name: response.client_name,
          total: Number(response.total),
          items: response.items.map((item) => ({
            id: item.id,
            productId: item.product.id,
            name: item.product.name,
            price: Number(item.price),
            quantity: item.quantity
          }))
        });
      } catch (error) {
        console.error(error);
        toast.error("Erro ao carregar orçamento");
      } finally {
        endLoading();
      }
    }
    getBudget()
    setFormData(selectedBudget);

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
      client_name: "",
      items: [],
      total: 0,
    })
  }

  return (
    <>
      <Modal
        centered
        show={show}
        onHide={onClose}
        size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Novo Orçamento</Modal.Title>
        </Modal.Header>

        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Nome do Cliente</Form.Label>
              <Form.Control
                name="client_name"
                value={formData.client_name}
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
              <tbody>
                <tr className="borderless">
                  <td>Total</td>
                  <td className="text-end"> R$ {formatMoney(formData.items.reduce((acc, item) => acc + (item.price * item.quantity), 0))}</td>
                </tr>
              </tbody>
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
