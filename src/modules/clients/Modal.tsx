import { useEffect, useState, type ChangeEvent } from "react";
import { Button, Col, Form, Modal, Row } from "react-bootstrap";
import { toast } from "sonner";
import { v4 as uuid } from "uuid";
import RequiredLabel from "../../components/RequiredLabel";
import { useLoading } from "../../context/LoadingContext";
import { formatDocument, formatPhone } from "../../utils/formaters";
import { isValidCNPJ, isValidCPF, onlyNumbers } from "../../utils/validators";
import ClientService from "./Service";
import type { Client } from "./types";
import globalService from "../../services/globalService";
import CustomSelect from "../../components/CustomSelect";

interface Props {
  show: boolean;
  onClose: () => void;
  selectedClient: Client | null
  onSuccess: () => void;
  isFromBudget?: boolean
}

export default function ClientModal({ show, onClose, selectedClient, onSuccess, isFromBudget }: Props) {
  const { endLoading, startLoading } = useLoading();
  const [formData, setFormData] = useState<Client>({
    name: "",
    document: "",
    address: "",
    number: "",
    city: "",
    state: "",
    phone: "",
  })
  const [stateList, setStateList] = useState<{ value: string, label: string }[]>([])
  const [cityList, setCityList] = useState<{ value: string, label: string }[]>([])

  useEffect(() => {
    globalService.getStates().then((states) => {
      const options = states
        .map((s: any) => ({
          value: s.sigla,
          label: `${s.sigla}`,
        }))
        .sort((a: any, b: any) => a.label.localeCompare(b.label));

      setStateList(options);
    });
  }, []);

  useEffect(() => {
    globalService.getCities(formData.state).then((cities) => {
      const options = cities
        .map((s: any) => ({
          value: s.nome,
          label: s.nome,
        }))
        .sort((a: any, b: any) => a.label.localeCompare(b.label));
      setCityList(options);
    })
  }, [formData.state])

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
    try {
      startLoading()
      if (selectedClient) {
        await ClientService.update(payload)
      } else {
        await ClientService.create({
          ...payload,
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

  useEffect(() => {
    if (!selectedClient) {
      clearForm();
      return;
    }

    const loadClient = async () => {
      try {
        startLoading();
        const response = await ClientService.getById(selectedClient.id!);
        setFormData({
          ...response,
          document: formatDocument(response.document)
        });

      } catch (error) {
        toast.error("Erro ao carregar cliente");
      } finally {
        endLoading();
      }
    };

    loadClient();
  }, [selectedClient]);

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
    setCityList([])

  }

  return (
    <Modal
      centered
      show={show}
      onHide={handleClose}
      size="lg"
      backdrop={isFromBudget ? false : "static"}
    >
      <Modal.Header closeButton>
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
                  options={stateList}
                  value={formData.state}
                  onChange={(value) =>
                    setFormData({ ...formData, state: String(value) })
                  }
                />
              </Form.Group>
            </Col>

            <Col lg={4} xs={12}>
              <Form.Group className="mb-2">
                <Form.Label>Cidade</Form.Label>
                <CustomSelect
                  options={cityList}
                  value={formData.city}
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
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit">
            Salvar
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
