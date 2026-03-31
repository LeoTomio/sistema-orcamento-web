import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Button, Col, Form, Modal, Row, Table } from "react-bootstrap";
import { Plus } from "react-bootstrap-icons";
import { toast } from "sonner";
import CustomSelect from "../../components/CustomSelect";
import { cacheTime } from "../../utils/enum";
import { formatMoney } from "../../utils/formaters";
import ClientModal from "../clients/Modal";
import clientService from "../clients/Service";
import ProductModal from "../products/Modal";
import productService from "../products/Service";
import BudgetItemTable from "./ItemTable";
import budgetService from "./Service";
import type { Budget } from "./types";
interface Props {
  show: boolean;
  onClose: () => void;
  selectedBudget: Budget | null
  onSuccess: () => void;
}

export default function BudgetModal({ show, onClose, selectedBudget, onSuccess }: Props) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<Budget>({
    clientId: "",
    items: [],
    total: 0,
  })
  const [openProductModal, setOpenProductModal] = useState(false);
  const [openClientModal, setOpenClientModal] = useState(false);

  const productsQuery = useQuery({
    queryKey: ["products"],
    queryFn: () => productService.getAll(),
    staleTime: cacheTime.fiveMinutes
  });

  const productOptions = productsQuery.data?.data
    .filter(product => !formData.items.some(item => item.productId === product.id)) // remove das opções os produtos que já foram adicionados
    .sort((a, b) => a.name.localeCompare(b.name)) // ordenar por nome
    .map(product => ({
      value: product.id!,
      label: product.name
    })) ?? [];

  const clientsQuery = useQuery({
    queryKey: ["clients"],
    queryFn: () => clientService.getAll(),
    staleTime: cacheTime.fiveMinutes
  });

  const clientOptions = clientsQuery.data?.data
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(client => ({
      value: client.id!,
      label: client.name
    })) ?? [];

  const saveMutation = useMutation({
    mutationFn: async (data: Budget) => {
      if (selectedBudget) return budgetService.update(data);

      return budgetService.create(data);
    },
    onSuccess: () => {
      onSuccess();
      handleClose();
    },
    onError: () => toast.error("Erro ao salvar orçamento")
  })

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
    saveMutation.mutate({
      ...formData,
      total: formData.items.reduce((acc, item) => acc + item.price * item.quantity, 0)
    });
  };

  const handleClose = () => {
    clearForm();
    onClose();
  };

  const budgetQuery = useQuery({
    queryKey: ["budget", selectedBudget?.id],
    enabled: !!selectedBudget,
    refetchOnMount: "always",
    queryFn: async () => {
      try {
        const response = await budgetService.getById(selectedBudget!.id!);
        return {
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
        };
      } catch (err) {
        toast.error("Erro ao carregar orçamento");
        throw err;
      }
    },
  });


  useEffect(() => {
    if (!show) return;

    if (!selectedBudget) {
      clearForm();
      return;
    }

    if (budgetQuery.data) {
      setFormData(budgetQuery.data);
    }
  }, [show, selectedBudget, budgetQuery.data]);

  const handleAddProduct = (productId: string) => {
    const product = productsQuery.data?.data.find(p => p.id === productId);
    if (!product) return;

    setFormData(prev => ({
      ...prev,
      items: [
        ...prev.items,
        {
          productId: product.id!,
          name: product.name,
          price: Number(product.price),
          quantity: 1
        }
      ]
    }));
  };

  const handleAddClient = (clientId: string) => {
    const client = clientsQuery.data?.data.find(c => c.id === clientId);
    if (!client) return;

    setFormData(prev => ({
      ...prev,
      clientId: client.id!,
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
          <Modal.Title> {selectedBudget ? "Editar" : "Novo"} Orçamento {selectedBudget ? `nº ${String(selectedBudget.number).padStart(4, "0")} ` : ""}</Modal.Title>
        </Modal.Header>

        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Nome do Cliente</Form.Label>
              <Row className="d-flex justify-content-center align-items-center">
                <Col xs={selectedBudget ? 12 : 9} md={selectedBudget ? 12 : 10} lg={selectedBudget ? 12 : 11}>
                  <CustomSelect
                    options={
                      clientOptions.map(client => ({
                        value: client.value!,
                        label: client.label
                      })) ?? []
                    }
                    isLoading={clientsQuery.isLoading}
                    value={formData.clientId}
                    onChange={(value) => {
                      if (value) handleAddClient(String(value));
                    }}
                    disabled={!!selectedBudget}
                  />
                </Col>

                {!selectedBudget && (
                  <Col xs={3} md={2} lg={1} className="ps-0">
                    <Button className="w-100">
                      <Plus size="1.5rem" onClick={() => setOpenClientModal(true)} />
                    </Button>
                  </Col>
                )}
              </Row>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Produto</Form.Label>
              <Row className="d-flex justify-content-center align-items-center">
                <Col xs={9} md={10} lg={11}>
                  <CustomSelect
                    options={
                      productOptions.map(product => ({
                        value: product.value!,
                        label: product.label
                      })) ?? []
                    }
                    isLoading={productsQuery.isLoading}
                    onChange={(value) => value && handleAddProduct(String(value))}
                    clearOnSelect
                  />
                </Col>

                <Col xs={3} md={2} lg={1} className="ps-0">
                  <Button className="w-100">
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
            <Button variant="secondary" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saveMutation.isPending}>
              {saveMutation.isPending ? "Salvando..." : "Salvar"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <ProductModal
        show={openProductModal}
        onClose={() => setOpenProductModal(false)}
        selectedProduct={null}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["products"] });
          toast.success("Produto adicionado com sucesso!");
        }}
        isFromBudget={true}
      />

      <ClientModal
        show={openClientModal}
        onClose={() => setOpenClientModal(false)}
        selectedClient={null}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["clients"] });
          toast.success("Cliente adicionado com sucesso!");
        }}
        isFromBudget={true}
      />
    </>
  );
}
