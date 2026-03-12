import { useEffect, useState } from "react";
import { Button, Col, Form, Modal, Row, Table } from "react-bootstrap";
import { Plus } from "react-bootstrap-icons";
import { toast } from "sonner";
import CustomSelect from "../../components/CustomSelect";
import { useLoading } from "../../context/LoadingContext";
import { formatMoney } from "../../utils/formaters";
import ClientModal from "../clients/Modal";
import ClientService from "../clients/Service";
import ProductModal from "../products/Modal";
import productService from "../products/Service";
import type { Product } from "../products/types";
import BudgetItemTable from "./ItemTable";
import BudgetService from "./Service";
import type { Budget } from "./types";

interface Props {
  show: boolean;
  onClose: () => void;
  selectedBudget: Budget | null
  onSuccess: () => void;
}

export default function BudgetModal({ show, onClose, selectedBudget, onSuccess }: Props) {
  const { endLoading, startLoading } = useLoading();
  const [formData, setFormData] = useState<Budget>({
    clientId: "",
    items: [],
    total: 0,
  })
  const [products, setProducts] = useState<Product[]>([]);
  const [openProductModal, setOpenProductModal] = useState(false);

  const [openClientModal, setOpenClientModal] = useState(false);
  const [clientList, setClientList] = useState<{ value: string, label: string }[]>([])

  const availableProducts = products
    .filter((p) => !formData.items.some((i) => i.productId === p.id))
    .map((p) => ({
      value: p.id!,
      label: p.name
    }))
    .sort((a: any, b: any) => a.label.localeCompare(b.label));


  useEffect(() => {
    loadProducts();
    loadClients()
  }, []);

  const loadProducts = async () => {
    const response = await productService.getAll();

    setProducts(response.data);
  };

  const loadClients = async () => {
    const response = await ClientService.getAll();
    const clientOptions = response.data.map((p) => ({
      value: p.id!,
      label: p.name
    })).sort((a: any, b: any) => a.label.localeCompare(b.label));
    setClientList(clientOptions);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { clientId, items } = formData
    if (!clientId) {
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
        await BudgetService.update(formData)
      } else {
        await BudgetService.create(formData);
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
    clearForm();
    onClose();
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
          clientId: response.clientId,
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

  const handleAddClient = (clientId: string) => {
    const client = clientList.find(c => c.value === clientId);
    if (!client) return;

    setFormData(prev => ({
      ...prev,
      clientId: client.value!,
    }));
  };

  const clearForm = () => {
    setFormData({
      clientId: "",
      items: [],
      total: 0,
    })
  }

  return (
    <>
      <Modal
        centered
        show={show}
        onHide={handleClose}
        size="lg"
        contentClassName={openProductModal || openClientModal ? "budget-with-overlay" : ""}>
        <Modal.Header closeButton>
          <Modal.Title> {selectedBudget ? "Editar" : "Novo"} Orçamento </Modal.Title>
        </Modal.Header>

        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Nome do Cliente</Form.Label>
              <Row>
                <Col xs={10} md={`${selectedBudget ? 12 : 11}`}>
                  <CustomSelect
                    options={clientList}
                    value={formData.clientId}
                    onChange={(value) => {
                      if (value) handleAddClient(String(value));
                    }}
                    disabled={!!selectedBudget}
                  />
                </Col>
                {!selectedBudget && <Col xs={2} md={1} className="ps-0">
                  <Button>
                    <Plus size="1.5rem" onClick={() => setOpenClientModal(true)} />
                  </Button>
                </Col>}
              </Row>

            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Produto</Form.Label>
              <Row >
                <Col xs={10} md={11}>
                  <CustomSelect
                    options={availableProducts}
                    onChange={(value) => {
                      if (value) handleAddProduct(String(value));
                    }}
                    clearOnSelect
                  />
                </Col>
                <Col xs={2} md={1} className="ps-0">
                  <Button>
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
              Salvar
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
            "Produto adicionado com sucesso!"
          );
        }}
        isFromBudget={true}
      />

      <ClientModal
        show={openClientModal}
        onClose={() => setOpenClientModal(false)}
        selectedClient={null}
        onSuccess={() => {
          loadClients();
          toast.success(
            "Cliente adicionado com sucesso!"
          );
        }}
        isFromBudget={true}
      />

    </>
  );
}
