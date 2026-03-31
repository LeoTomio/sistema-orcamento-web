import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useState, type ChangeEvent } from "react";
import { Button, Col, Form, Modal, Row } from "react-bootstrap";
import { toast } from "sonner";
import CustomSelect from "../../components/CustomSelect";
import RequiredLabel from "../../components/RequiredLabel";
import globalService from "../../services/globalService";
import { cacheTime } from "../../utils/enum";
import { formatDocument, formatPhone } from "../../utils/formaters";
import { isValidCNPJ, isValidCPF, onlyNumbers } from "../../utils/validators";
import clientService from "./Service";
import type { Client } from "./types";

interface Props {
  show: boolean;
  onClose: () => void;
  selectedClient: Client | null
  onSuccess: () => void;
  isFromBudget?: boolean
}

export default function ClientModal({ show, onClose, selectedClient, onSuccess, isFromBudget }: Props) {
  const [formData, setFormData] = useState<Client>({
    name: "",
    document: "",
    address: "",
    number: "",
    city: "",
    state: "",
    phone: "",
  })

  const statesQuery = useQuery({
    queryKey: ["states"],
    queryFn: () => globalService.getStates(),
    staleTime: cacheTime.fiveMinutes
  });

  const citiesQuery = useQuery({
    queryKey: ["cities", formData.state],
    queryFn: () => globalService.getCities(formData.state),
    staleTime: cacheTime.fiveMinutes,
    enabled: !!formData.state
  });

  const saveMutation = useMutation({
    mutationFn: async (data: Client) => {
      if (selectedClient) return clientService.update(data);

      return clientService.create(data);
    },
    onSuccess: () => {
      onSuccess();
      handleClose();
    },
    onError: () => toast.error("Erro ao salvar cliente")
  })

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { name, document } = formData
    if (!name) {
      toast.warning('Campo cliente é obrigatório')
      return
    }
    const numbers = onlyNumbers(document);

    if (numbers.length === 11 && !isValidCPF(document)) {
      toast.warning("CPF inválido");
      return;
    }

    if (numbers.length === 14 && !isValidCNPJ(document)) {
      toast.warning("CNPJ inválido");
      return;
    }

    if (numbers.length !== 11 && numbers.length !== 14) {
      toast.warning("Documento deve ter 11 ou 14 dígitos");
      return;
    }

    const phoneNumbers = onlyNumbers(formData.phone);

    if (phoneNumbers && phoneNumbers.length !== 11) {
      toast.warning("Telefone deve conter 11 dígitos");
      return;
    }

    const payload = {
      ...formData,
      document: numbers
    };

    saveMutation.mutate(payload);
  };
  const handleClose = () => {
    clearForm();
    onClose();
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    let formatedValue = value

    if (name === "document") {
      formatedValue = formatDocument(value);
    } else if (name === "phone") {
      formatedValue = formatPhone(value);
    }

    setFormData(prev => ({
      ...prev,
      [name]: formatedValue
    }));
  };

  const clientQuery = useQuery({
    queryKey: ["client", selectedClient?.id],
    enabled: !!selectedClient,
    refetchOnMount: "always",
    queryFn: async () => {
      try {
        const response = await clientService.getById(selectedClient!.id!);
        return {
          ...response,
          document: formatDocument(response.document),
        };
      } catch (err) {
        toast.error("Erro ao carregar cliente");
        throw err;
      }
    },
  });

  useEffect(() => {
    if (!show) return;

    if (!selectedClient) {
      clearForm();
      return;
    }

    if (clientQuery.data) {
      setFormData(clientQuery.data);
    }
  }, [show, selectedClient, clientQuery.data]);


  const clearForm = () => {
    setFormData({
      name: "",
      document: "",
      address: "",
      number: "",
      city: "",
      state: "",
      phone: "",
    })

  }

  return (
    <Modal
      centered
      show={show}
      onHide={handleClose}
      size="lg"
      backdrop={isFromBudget ? false : "static"}
    >
      <Modal.Header closeButton onHide={handleClose}>
        <Modal.Title>{selectedClient ? "Editar" : "Novo"} Cliente</Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Row>
            <Col lg={12} xs={12}>
              <Form.Group className="mb-2">
                <RequiredLabel>Nome</RequiredLabel>
                <Form.Control
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Digite o nome"
                />
              </Form.Group>
            </Col>

            <Col lg={5} xs={12}>
              <Form.Group className="mb-2">
                <RequiredLabel>CPF/CNPJ</RequiredLabel>
                <Form.Control
                  name="document"
                  value={formData.document}
                  onChange={handleChange}
                  required
                  placeholder="Digite CPF ou CNPJ"
                />
              </Form.Group>
            </Col>
            <Col lg={4} xs={12}>
              <Form.Group className="mb-2">
                <Form.Label>Telefone</Form.Label>
                <Form.Control
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Digite o telefone"
                />
              </Form.Group>
            </Col>

            <Col lg={3} xs={12}>
              <Form.Group className="mb-2">
                <Form.Label>Estado</Form.Label>
                <CustomSelect
                  options={statesQuery.data?.map((s: any) => ({
                    value: s.sigla,
                    label: `${s.sigla}`,
                  }))
                    .sort((a: any, b: any) => a.label.localeCompare(b.label)) || []}
                  value={formData.state}
                  isLoading={statesQuery.isLoading}
                  onChange={(value) =>
                    setFormData({ ...formData, state: String(value), city: "" })
                  }
                />
              </Form.Group>
            </Col>

            <Col lg={4} xs={12}>
              <Form.Group className="mb-2">
                <Form.Label>Cidade</Form.Label>
                <CustomSelect
                  options={citiesQuery.data?.map((s: any) => ({
                    value: s.nome,
                    label: s.nome,
                  })).sort((a: any, b: any) => a.label.localeCompare(b.label)) || []}
                  value={formData.city}
                  isLoading={citiesQuery.isLoading}
                  onChange={(value) =>
                    setFormData({ ...formData, city: String(value) })
                  }
                />

              </Form.Group>
            </Col>

            <Col lg={6} xs={12}>
              <Form.Group className="mb-2">
                <Form.Label>Bairro</Form.Label>
                <Form.Control
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Digite o bairro"
                />
              </Form.Group>
            </Col>

            <Col lg={2} xs={12}>
              <Form.Group className="mb-2">
                <Form.Label>Nº</Form.Label>
                <Form.Control
                  name="number"
                  value={formData.number}
                  onChange={handleChange}
                  placeholder="Digite o número"
                />
              </Form.Group>
            </Col>
          </Row>
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
  );
}
