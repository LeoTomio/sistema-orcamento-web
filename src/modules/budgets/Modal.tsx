import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { Button, Col, Form, Modal, Row } from "react-bootstrap";
import { Plus } from "react-bootstrap-icons";
import { toast } from "sonner";
import CustomSelect from "../../components/CustomSelect";
import RequiredLabel from "../../components/RequiredLabel";
import { cacheTime } from "../../utils/enum";
import { formatMoney } from "../../utils/formaters";
import ClientModal from "../clients/Modal";
import clientService from "../clients/Service";
import materialService from "../materials/Service";
import ProductModal from "../products/Modal";
import productService from "../products/Service";
import BudgetItemTable from "./ItemTable";
import budgetService from "./Service";
import type { Budget } from "./types";
import { useAuth } from "../../context/AuthContext";
interface Props {
  show: boolean;
  onClose: () => void;
  selectedBudget: string | null
  onSuccess: () => void;
}

export default function BudgetModal({ show, onClose, selectedBudget, onSuccess }: Props) {
  const { user } = useAuth()
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<Budget>({
    clientId: "",
    items: [],
    total: 0,
    labor: 0
  })
  const [formattedLabor, setFormattedLabor] = useState("0,00");
  const [itemsTotal, setItemsTotal] = useState(0);
  const [openProductModal, setOpenProductModal] = useState(false);
  const [openClientModal, setOpenClientModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);

  const clientsQuery = useQuery({
    queryKey: ["clients", user?.id],
    queryFn: () => clientService.getAll(),
    staleTime: cacheTime.fiveMinutes,
    enabled: !!user?.id
  });

  const clientOptions = clientsQuery.data?.data
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(client => ({
      value: client.id!,
      label: client.name
    })) ?? [];

  const productsQuery = useQuery({
    queryKey: ["budget-products", user?.id],
    queryFn: () => productService.getToBudget(),
    staleTime: cacheTime.fiveMinutes,
    enabled: !!user?.id
  });
  const productOptions = productsQuery.data?.sort((a, b) => a.name.localeCompare(b.name))
    .map(product => ({
      value: product.id!,
      label: product.name
    })) ?? [];

  const materialQuery = useQuery({
    queryKey: ["budget-materials", user?.id],
    queryFn: () => materialService.getToBudget(),
    staleTime: cacheTime.fiveMinutes,
    enabled: !!user?.id
  });

  const materialsMap = useMemo(() => {
    if (!materialQuery.data) return new Map();

    const sorted = [...materialQuery.data].sort((a, b) =>
      a.name.localeCompare(b.name)
    );

    const map = new Map();
    sorted.forEach(m => map.set(m.id, m));

    return map;
  }, [materialQuery.data]);


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

    const { clientId, items } = formData;

    if (!clientId) {
      toast.warning('Campo cliente é obrigatório');
      return;
    }

    if (items.length === 0) {
      toast.warning("É necessario ter ao menos 1 item");
      return;
    }

    const sanitizedItems = items.map((item) => {
      const sanitizedMaterials = item.materials?.map((m) => ({
        ...m,
        unitPrice: Number(
          String(m.unitPrice).replace(/\./g, "").replace(",", ".")
        ),
      }));

      return {
        ...item,
        width: item.hasWidth ? item.width ?? null : null,
        height: item.hasHeight ? item.height ?? null : null,
        materials: sanitizedMaterials,
      };
    });

    saveMutation.mutate({
      ...formData,
      items: sanitizedItems,
      total: sanitizedItems.reduce(
        (acc, item) => acc + item.price * item.quantity,
        0
      ),
    });
  };

  const handleClose = () => {
    clearForm();
    onClose();
  };

  const budgetQuery = useQuery({
    queryKey: ["budget", user?.id, selectedBudget],
    enabled: !!selectedBudget && !!user?.id,
    refetchOnMount: "always",
    queryFn: async () => {
      try {
        const response = await budgetService.getById(selectedBudget!);

        return {
          id: response.id,
          clientId: response.clientId,
          total: Number(response.total),
          labor: Number(response.labor),
          number: response.number,
          items: response.items.map(item => ({
            id: item.id,
            productId: item.product.id,
            name: item.product.name,
            quantity: item.quantity,
            price: Number(item.price),

            width: item.width,
            height: item.height,
            hasWidth: item.product.hasWidth,
            hasHeight: item.product.hasHeight,

            materials: item.materials?.map(m => ({
              id: m.id,
              materialId: m.material.id,
              name: m.material.name,
              calcType: m.calcType,
              quantity: m.quantity,
              unitPrice: Number(m.unitPrice),
              total: Number(m.total)
            })) || []
          }))
        } as Budget;
      } catch (err) {
        toast.error("Erro ao carregar orçamento");
        throw err;
      }
    }
  });

  useEffect(() => {
    if (!show) return;

    if (!selectedBudget) {
      clearForm();
      return;
    }

    if (budgetQuery.data) {
      setFormData(budgetQuery.data);

      setFormattedLabor(
        budgetQuery.data.labor ? budgetQuery.data.labor.toLocaleString("pt-BR", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }) : "0,00"
      );
    }
  }, [show, selectedBudget, budgetQuery.data]);

  const handleAddProduct = (productId: string) => {
    const product = productsQuery.data?.find(p => p.id === productId);
    if (!product) return;

    // calcular materiais iniciais do produto
    const materials = product.materials.map(mat => ({
      materialId: mat.id,
      name: mat.name,
      calcType: mat.calcType,
      quantity: mat.quantity,
      unitPrice: mat.price,
      total: mat.quantity * mat.price
    }));
    setFormData(prev => ({
      ...prev,
      items: [
        ...prev.items,
        {
          productId: product.id,
          name: product.name,
          price: Number(product.price),
          quantity: 1,
          width: product.hasWidth ? 1 : undefined,
          height: product.hasHeight ? 1 : undefined,
          hasWidth: product.hasWidth,
          hasHeight: product.hasHeight,
          materials
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

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;

    // extrai apenas números
    const onlyNumbers = raw.replace(/\D/g, "");
    const cents = Number(onlyNumbers) || 0;

    // salva no estado (valor real)
    const numericValue = cents / 100;

    setFormData(prev => ({ ...prev, labor: numericValue }));

    // exibe formatado no input
    setFormattedLabor(
      numericValue.toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    );
  };
  const clearForm = () => {
    setFormData({
      clientId: "",
      items: [],
      total: 0,
      labor: 0
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
          <Modal.Title> {selectedBudget ? "Editar" : "Novo"} Orçamento {selectedBudget ? `nº ${String(formData.number).padStart(4, "0")} ` : ""}</Modal.Title>
        </Modal.Header>

        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <RequiredLabel>Cliente</RequiredLabel>
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
                    options={productOptions}
                    value={selectedProduct}
                    onChange={(value) => {
                      setSelectedProduct(String(value) ?? null);

                      if (value) {
                        handleAddProduct(String(value));
                        setSelectedProduct(null);
                      }
                    }}
                    placeholder="Selecione um produto"
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
              products={productsQuery.data ?? []}
              materialsMap={materialsMap}
              onTotalChange={setItemsTotal}
            />

            <Form.Group className="my-3">
              <Form.Label>Mão de obra R$</Form.Label>
              <Form.Control
                name="labor"
                value={formattedLabor}
                onChange={handleChange}
              />
            </Form.Group>
            <hr className="mt-4" />
            <div className="d-flex justify-content-between px-2">
              <h5>Total</h5>
              <h5 className="fw-bold text-success">R$ {formatMoney(Number(formData.labor ?? 0) + itemsTotal)}</h5>
            </div>
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
          queryClient.invalidateQueries({ queryKey: ["budget-products", user?.id] });
          queryClient.invalidateQueries({ queryKey: ["products", user?.id] });
          toast.success("Produto adicionado com sucesso!");
        }}
        isFromBudget={true}
      />

      <ClientModal
        show={openClientModal}
        onClose={() => setOpenClientModal(false)}
        selectedClient={null}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["clients", user?.id] });
          toast.success("Cliente adicionado com sucesso!");
        }}
        isFromBudget={true}
      />
    </>
  );
}
