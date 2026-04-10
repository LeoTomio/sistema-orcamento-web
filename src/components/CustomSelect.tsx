import Select from "react-select";

type Option = {
  value: string | number;
  label: string;
};

type CustomSelectProps = {
  options: Option[];
  value?: string | number | null;
  onChange: (value: string | number | undefined) => void;
  placeholder?: string;
  clearOnSelect?: boolean;
  disabled?: boolean
  isLoading?: boolean;
};

const CustomSelect = ({ options, value, onChange, placeholder = "Selecione", clearOnSelect = false, disabled, isLoading }: CustomSelectProps) => {
  const inputHeight = "2.8rem";
  const selectedOption = options.find(o => o.value === value);
  return (
    <Select
      options={options}
      value={clearOnSelect ? null : (selectedOption ?? null)} // se quiser que quando selecionar um item limpe o select, descomentar  linha
      // value={selectedOption ?? null}
      placeholder={placeholder}
      isLoading={isLoading}
      isDisabled={disabled}
      onChange={(selected) => {
        onChange(selected?.value);
      }}
      components={{
        DropdownIndicator: () => null,
        IndicatorSeparator: () => null,
      }}
      isClearable
      styles={{
        input: (base) => ({
          ...base,
          margin: 0,
          padding: 0,
          paddingLeft: "0.1rem",
        }),
        placeholder: (base) => ({
          ...base,
          position: "absolute",
          top: "8px",
        }),
        control: (base) => ({
          ...base,
          borderRadius: "0.6rem",
          border: "1px solid #e5e7eb",
          height: "2.8rem",
          paddingBottom: "8px !important",
          minHeight: "2.8rem",
          fontSize: "0.95rem",
          boxShadow: "none"
        }),
        valueContainer: (base) => ({
          ...base,
          display: "flex",
          alignItems: "center",
        }),
        singleValue: (base) => ({
          ...base,
          position: "absolute",
          top: "8px"
        }),
        indicatorsContainer: (base) => ({
          ...base,
          height: inputHeight,
        }),
        menuList: (base) => ({
          ...base,
          overflowY: "auto",
        }),
      }}
    />
  );
};

export default CustomSelect;