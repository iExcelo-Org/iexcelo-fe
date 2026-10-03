"use client";

import {
  ChangeEvent,
  ComponentType,
  FC,
  FocusEvent,
  forwardRef,
  InputHTMLAttributes,
  memo,
  Ref,
  TextareaHTMLAttributes,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { defaultCountries, parseCountry } from "react-international-phone";
import Select, {
  ClearIndicatorProps,
  components,
  ControlProps,
  DropdownIndicatorProps,
  GroupBase,
  MultiValueGenericProps,
  MultiValueRemoveProps,
  OptionProps,
  ValueContainerProps,
} from "react-select";
import { CustomDateTimePicker } from ".";
import { TipTap, SyntheticEvent, RichTextProps } from ".";
import { Icon } from "@iconify/react";
import { useUtilsStore } from "@/store";

// ── Tel: country data ─────────────────────────────────────────────────────────

function telFlagEmoji(iso2: string): string {
  return iso2
    .toUpperCase()
    .replace(/./g, (ch) => String.fromCodePoint(ch.charCodeAt(0) + 127397));
}

type CountryTelOption = {
  value: string;
  dialCode: string;
  name: string;
  flag: string;
};

const COUNTRY_TEL_OPTIONS: CountryTelOption[] = defaultCountries.map((raw) => {
  const { iso2, dialCode, name } = parseCountry(raw);
  return { value: iso2, dialCode, name, flag: telFlagEmoji(iso2) };
});

const DEFAULT_TEL_COUNTRY =
  COUNTRY_TEL_OPTIONS.find((c) => c.value === "ng") ?? COUNTRY_TEL_OPTIONS[0];

function parseInitialTel(
  value: string | undefined,
  defaultIso2: string,
): { iso2: string; number: string } {
  if (!value || !value.startsWith("+"))
    return { iso2: defaultIso2, number: value ?? "" };
  const match = COUNTRY_TEL_OPTIONS.find((c) =>
    value.startsWith(`+${c.dialCode}`),
  );
  if (!match) return { iso2: defaultIso2, number: value };
  return { iso2: match.value, number: value.slice(match.dialCode.length + 1) };
}

// ── TelCountrySelect ──────────────────────────────────────────────────────────

type TelCountrySelectProps = {
  selected: CountryTelOption;
  onChange: (c: CountryTelOption) => void;
  disabled?: boolean;
};

const TelCountrySelect: FC<TelCountrySelectProps> = ({
  selected,
  onChange,
  disabled,
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [dropStyle, setDropStyle] = useState<React.CSSProperties>({});
  const btnRef = useRef<HTMLButtonElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return COUNTRY_TEL_OPTIONS;
    return COUNTRY_TEL_OPTIONS.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.dialCode.includes(q) ||
        c.value.includes(q),
    );
  }, [search]);

  const openDropdown = () => {
    if (disabled || !btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    const dropWidth = Math.min(268, window.innerWidth - 16);
    const left = Math.min(rect.left, window.innerWidth - dropWidth - 8);
    setDropStyle({
      position: "fixed",
      top: rect.bottom + 4,
      left,
      width: dropWidth,
      zIndex: 9999,
    });
    setOpen(true);
    setTimeout(() => searchRef.current?.focus(), 40);
  };

  const closeDropdown = () => {
    setOpen(false);
    setSearch("");
  };

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (
        btnRef.current?.contains(e.target as Node) ||
        dropRef.current?.contains(e.target as Node)
      )
        return;
      closeDropdown();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeDropdown();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  const dropdown = open ? (
    <div
      ref={dropRef}
      style={dropStyle}
      className="bg-white rounded-[.5rem] border border-[#EAECF0] shadow-[0px_12px_16px_-4px_rgba(16,24,40,0.08),0px_4px_6px_-2px_rgba(16,24,40,0.03)] overflow-hidden"
    >
      <div className="px-2.5 pt-2.5 pb-2">
        <div className="flex items-center gap-2 border border-[#E5E7EB] rounded-[.5rem] px-2.5 py-1.5 bg-white focus-within:border-[#007FFF] transition-colors">
          <Icon
            icon="mynaui:search"
            className="w-3.5 h-3.5 text-[#9CA3AF] shrink-0"
          />
          <input
            ref={searchRef}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search country…"
            className="flex-1 min-w-0 border-none! bg-transparent outline-none text-[.8125rem] text-black placeholder:text-[#9CA3AF]"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="text-[#9CA3AF] hover:text-black transition-colors"
            >
              <Icon icon="mdi:close" className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
      <ul className="overflow-y-auto max-h-52 px-1.5 pb-1.5">
        {filtered.length === 0 && (
          <li className="text-[.8125rem] text-[#9CA3AF] px-2 py-3 text-center">
            No countries found
          </li>
        )}
        {filtered.map((c) => {
          const isSelected = selected.value === c.value;
          return (
            <li key={c.value} className="mb-0.5">
              <button
                type="button"
                onClick={() => {
                  onChange(c);
                  closeDropdown();
                }}
                className={`w-full flex items-center gap-2.5 rounded-md px-2 py-[0.4375rem] text-[.875rem] font-normal text-left cursor-pointer transition-colors hover:bg-[#F9FAFB] ${isSelected ? "bg-[#F0F7FF]" : ""}`}
              >
                <span className="text-[1.125rem] leading-none shrink-0">
                  {c.flag}
                </span>
                <span className="flex-1 text-[#101828] truncate">
                  {c.name}
                </span>
                <span className="text-[#9CA3AF] text-[.8125rem] tabular-nums shrink-0">
                  +{c.dialCode}
                </span>
                {isSelected && (
                  <Icon
                    icon="lucide:check"
                    color="#007FFF"
                    width=".875rem"
                    height=".875rem"
                    className="shrink-0"
                  />
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  ) : null;

  return (
    <div className="relative h-full w-[33%] max-w-[8rem] shrink-0 min-w-0 overflow-hidden">
      <button
        ref={btnRef}
        type="button"
        disabled={disabled}
        onClick={open ? closeDropdown : openDropdown}
        className={`flex items-center gap-1.5 h-full w-full pl-3 pr-2 border-r border-[#D0D5DD] bg-transparent text-[.875rem] text-[#667085] cursor-pointer hover:bg-[#F9FAFB] active:bg-[#F3F4F6] transition-colors focus:outline-none ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
      >
        <span className="text-[1rem] leading-none shrink-0">
          {selected.flag}
        </span>
        <span className="tabular-nums flex-1 text-left text-[.8125rem] truncate">
          +{selected.dialCode}
        </span>
        <Icon
          icon="hugeicons:arrow-up-01"
          className="w-[1rem] h-[1rem] text-[#D0D5DD] shrink-0"
          style={{
            transition: "transform .3s",
            transform: open ? "rotate(0deg)" : "rotate(180deg)",
          }}
        />
      </button>
      {typeof window !== "undefined" && createPortal(dropdown, document.body)}
    </div>
  );
};

// ── TelInputRender ────────────────────────────────────────────────────────────

type TelInputRenderProps = {
  name: string;
  value?: string;
  onChange?: (e: { target: { name?: string; value: string } }) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
};

const TelInputRender: FC<TelInputRenderProps> = ({
  name,
  value,
  onChange,
  placeholder,
  disabled,
  error,
}) => {
  const parsed = parseInitialTel(value, DEFAULT_TEL_COUNTRY.value);
  const [country, setCountry] = useState<CountryTelOption>(
    COUNTRY_TEL_OPTIONS.find((c) => c.value === parsed.iso2) ??
      DEFAULT_TEL_COUNTRY,
  );
  const [rawNumber, setRawNumber] = useState(parsed.number);

  const emit = (c: CountryTelOption, num: string) => {
    onChange?.({ target: { name, value: num ? `+${c.dialCode}${num}` : "" } });
  };

  const handleCountryChange = (c: CountryTelOption) => {
    setCountry(c);
    emit(c, rawNumber);
  };
  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRawNumber(e.target.value);
    emit(country, e.target.value);
  };

  return (
    <div
      className={`border outline-none transition-all duration-[.4s] ${
        error
          ? "border-[#FDA29B]"
          : "border-[#D0D5DD] focus-within:border-[#007FFF]"
      } flex h-[2.75rem] w-full overflow-hidden rounded-[.5rem] bg-white`}
    >
      <TelCountrySelect
        selected={country}
        onChange={handleCountryChange}
        disabled={disabled}
      />
      <input
        type="tel"
        name={name}
        value={rawNumber}
        onChange={handleNumberChange}
        placeholder={placeholder ?? "801 234 5678"}
        disabled={disabled}
        className={`flex-1 min-w-0 bg-transparent outline-none px-3 h-full text-[1rem] font-[400] text-[#667085] placeholder:font-[300] placeholder:opacity-70 ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
      />
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────

export type SelectOption = {
  value: string | number | null;
  label: string;
};
export type IInputTypes =
  | "text"
  | "number"
  | "textarea"
  | "select"
  | "multi-select"
  | "rich-text"
  | "date"
  | "datetime-local"
  | "tel"
  | "password"
  | "email";

type BaseProps = {
  type?: IInputTypes;
  name?: string;
  label?: string | null;
  error?: string;
  placeholder?: string;
  value?:
    | string
    | number
    | null
    | SelectOption
    | SelectOption[]
    | readonly string[]
    | undefined;
  onChange?:
    | ((event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void)
    | ((event: {
        target: {
          name?: string;
          value: any;
        };
      }) => void);
  onBlur?: (event: FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  selectOptions?: SelectOption[];
  disabled?: boolean;
  richTextProps?: RichTextProps;
  telProps?: {
    inputProps?: {
      disabled?: boolean;
      name?: string;
      value?: string;
      placeholder?: string;
      onChange?: (
        event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
      ) => void;

      onBlur?: (
        event: FocusEvent<HTMLInputElement | HTMLTextAreaElement>,
      ) => void;
    };
    selectProps?: {
      name?: string;
      placeholder?: string;
      disabled?: boolean;
      value?: string;
      onBlur?: (
        event: FocusEvent<HTMLInputElement | HTMLTextAreaElement>,
      ) => void;

      onChange?: (event: {
        target: {
          name?: string;
          value: string;
        };
      }) => void;
    };
  };
};

// Merge common attributes from input and textarea
type MergedHTMLAttributes = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type" | "value" | "onChange" | "onBlur"
> &
  Omit<
    TextareaHTMLAttributes<HTMLTextAreaElement>,
    "value" | "onChange" | "onBlur"
  >;

export interface InputFieldProps extends BaseProps, MergedHTMLAttributes {}

const CustomOption: FC<OptionProps<unknown, boolean, GroupBase<any>>> = (
  props,
) => {
  const { isSelected, label, data, options } = props;

  const isLastOption =
    (options[options.length - 1] as { value: string })?.value ===
    (data as { value: string })?.value;

  return (
    <components.Option {...props}>
      <li
        className={`flex cursor-pointer items-center justify-between rounded-[0.375rem] p-[0.625rem_0.5rem] text-[#101828] ${
          isSelected && "bg-[#F9FAFB]"
        } transition-all duration-[.4s] hover:bg-[#F9FAFB] ${
          isLastOption ? "" : "mb-[0.25rem]"
        } text-[1rem] font-[400] leading-[1.5rem]`}
      >
        {label}
        {isSelected && (
          <Icon icon={"hugeicons:checkmark-circle-01"} color="#007FFF" />
        )}
      </li>
    </components.Option>
  );
};

const CustomControl: FC<ControlProps<unknown, boolean, GroupBase<unknown>>> = ({
  children,
  ...props
}) => (
  <components.Control {...props}>
    <div
      style={{
        padding: "0px 0.1875rem 0px 0.875rem",
        alignItems: "center",
        margin: 0,
        width: "100%",
        height: "100%",
        fontSize: "1rem",
        display: "flex",
      }}
    >
      {children}
    </div>
  </components.Control>
);

const CustomMultiValueContainer: FC<
  MultiValueGenericProps<unknown, boolean, GroupBase<any>>
> = (props) => <components.MultiValueContainer {...props} />;

const CustomMultiValueLabel: FC<
  MultiValueGenericProps<unknown, boolean, GroupBase<any>>
> = (props) => {
  return <components.MultiValueLabel {...props} />;
};

// CustomMultiValueRemove
const CustomMultiValueRemove = (props: MultiValueRemoveProps) => {
  return (
    <components.MultiValueRemove {...props}>
      <Icon icon={"hugeicons:cancel-circle"} color="#98A2B3" />
    </components.MultiValueRemove>
  );
};

const CustomValueContainer: FC<
  ValueContainerProps<unknown, boolean, GroupBase<any>>
> = ({ children, ...props }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showEllipsis, setShowEllipsis] = useState(false);
  const count = (props.getValue() as SelectOption[]).length;

  useEffect(() => {
    if (!props.isMulti) return;
    const el = scrollRef.current;
    if (!el) return;
    requestAnimationFrame(() => {
      const overflowing = el.scrollWidth > el.clientWidth;
      setShowEllipsis(overflowing);
      el.scrollLeft = el.scrollWidth - el.clientWidth;
    });
  }, [count, props.isMulti]);

  if (!props.isMulti)
    return (
      <components.ValueContainer {...props}>
        {children}
      </components.ValueContainer>
    );

  return (
    <components.ValueContainer {...props}>
      {showEllipsis && (
        <span
          style={{
            fontSize: "0.75rem",
            color: "#98A2B3",
            flexShrink: 0,
            userSelect: "none",
            paddingRight: "4px",
          }}
        >
          …
        </span>
      )}
      <div
        ref={scrollRef}
        className="no-scrollbar"
        style={{
          display: "flex",
          flexWrap: "nowrap",
          overflowX: "auto",
          overflowY: "hidden",
          flex: 1,
          minWidth: 0,
          alignItems: "center",
          scrollbarWidth: "none",
        }}
      >
        {children}
      </div>
    </components.ValueContainer>
  );
};

const InputField = memo(
  forwardRef<any, InputFieldProps>(
    (
      {
        type = "text",
        name = "input",
        label = null,
        error,
        placeholder = "johnex@iexcelo.com",
        value,
        onChange,
        selectOptions,
        disabled,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        telProps: _telProps,
        richTextProps,
        onBlur,
        ...rest
      },
      ref,
    ) => {
      const [showPassword, setVisibility] = useState(false);
      const { uploadImage, isUploadingImage } = useUtilsStore();
      const [hydrated, setHydrated] = useState(false);

      const CustomDropdownIndicator = (props: DropdownIndicatorProps) => {
        return (
          <components.DropdownIndicator {...props}>
            {error && type !== "tel" ? (
              <Icon icon={"hugeicons:information-circle"} color="#F04438" />
            ) : (
              <Icon
                icon={"hugeicons:arrow-up-01"}
                color={props.isFocused ? "#007FFF" : "#D0D5DD"}
                height={"1.25rem"}
                width={"1.25rem"}
                style={{
                  transition: "all .4s",
                  transform: !props.selectProps.menuIsOpen
                    ? "rotate(180deg)"
                    : undefined,
                }}
              />
            )}
          </components.DropdownIndicator>
        );
      };

      useEffect(() => {
        if (typeof window !== "undefined") setHydrated(true);
      }, []);
      if (hydrated)
        return (
          <div className="flex w-full flex-col gap-[0.375rem] transition-all duration-[.4s]">
            {label && (
              <label
                htmlFor={name}
                className="text-[0.875rem] font-[500] leading-[1.25rem] text-[#344054]"
              >
                {label}
              </label>
            )}
            <div className="relative group h-fit w-full">
              {type === "textarea" ? (
                <textarea
                  disabled={!!disabled}
                  id={name}
                  name={name}
                  placeholder={placeholder}
                  value={value as string}
                  onChange={onChange && onChange}
                  onBlur={onBlur && onBlur}
                  ref={ref as Ref<HTMLTextAreaElement>}
                  className={`border outline-none ${
                    !!error
                      ? "border-[#FDA29B] text-[#F04438]"
                      : "border-[#D0D5DD] text-[#667085]"
                  } h-[6.25rem] w-full rounded-[0.5rem] bg-white p-[0.625rem_0.875rem] text-[1rem] font-[400] leading-[1.5rem] placeholder:font-[300] placeholder:opacity-[.7]`}
                  {...rest}
                />
              ) : type === "select" || type === "multi-select" ? (
                <Select
                  instanceId={"client"}
                  isDisabled={!!disabled}
                  isMulti={type === "multi-select"}
                  options={selectOptions && selectOptions}
                  value={
                    type === "multi-select"
                      ? (value as string)
                          ?.split(",")
                          ?.map((val) => val.trim())
                          ?.map((val) =>
                            selectOptions?.find(
                              (option) => option.value === val,
                            ),
                          )
                          .filter(Boolean)
                      : selectOptions?.find((option) => option.value === value)
                  }
                  menuPlacement="auto"
                  menuPosition="fixed"
                  menuPortalTarget={document.body}
                  onChange={(selectedOptions) => {
                    const syntheticEvent = {
                      target: {
                        name: name || "select",
                        value: Array.isArray(selectedOptions)
                          ? selectedOptions
                              .map((option) => option.value)
                              .join(", ") // Convert to a string with commas
                          : (selectedOptions as SelectOption)?.value, // For single select, get the value directly
                        selectedOptions,
                      },
                    };

                    onChange?.(
                      syntheticEvent as ChangeEvent<
                        HTMLInputElement | HTMLTextAreaElement
                      > & {
                        target: {
                          name?: string | undefined;
                          value: any;
                          selectedOptions?: SelectOption[] | undefined;
                        };
                      },
                    );
                  }}
                  onBlur={onBlur && onBlur}
                  placeholder={placeholder}
                  ref={ref}
                  components={{
                    Option: CustomOption,
                    Control: CustomControl,
                    DropdownIndicator: CustomDropdownIndicator,
                    ValueContainer: CustomValueContainer,
                    MultiValueContainer: CustomMultiValueContainer,
                    MultiValueLabel: CustomMultiValueLabel,
                    MultiValueRemove: CustomMultiValueRemove,
                    ClearIndicator: null as unknown as ComponentType<
                      ClearIndicatorProps<any, boolean, GroupBase<any>>
                    >,
                  }}
                  closeMenuOnSelect={!(type === "multi-select")}
                  hideSelectedOptions={false}
                  styles={{
                    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                    valueContainer: (provided) => ({
                      ...provided,
                      padding: 0,
                    }),
                    menu: (provided) => ({
                      ...provided,
                      backgroundColor: "#fff",
                      minHeight: 0,
                      height: "fit-content",
                      marginTop: "0.25rem",
                      overflow: "auto",
                      padding: "0.25rem 0.375rem",
                      borderRadius: "0.5rem",
                      border: !!error
                        ? "1px solid #FDA29B"
                        : "1px solid #EAECF0",
                      boxShadow:
                        "0px 0.75rem 1rem -0.25rem rgba(16, 24, 40, 0.08), 0px 0.25rem 0.375rem -2px rgba(16, 24, 40, 0.03)",
                    }),
                    multiValueRemove: () => ({}),
                    indicatorSeparator: () => ({
                      display: "none",
                    }),
                    option: () => ({
                      padding: "0",
                      margin: "0",
                    }),
                    placeholder: (provided) => ({
                      ...provided,
                      margin: 0,
                      padding: 0,
                      opacity: 0.7,
                      fontWeight: 300,
                    }),
                    singleValue: (provided) => ({
                      ...provided,
                      fontWeight: 400,
                      color: "#667085",
                    }),
                    multiValue: () => ({
                      display: "flex",
                      alignItems: "center",
                      backgroundColor: "#fff",
                      gap: "0.1875rem",
                      width: "max-content",
                      boxSizing: "border-box",
                      border: "1px solid #D0D5DD",
                      padding: "0.25rem",
                      borderRadius: "0.375rem",
                      margin: 0,
                      marginRight: "0.375rem",
                    }),
                    multiValueLabel: () => ({
                      fontSize: "0.875rem",
                      color: "#344054",
                      fontWeight: 400,
                      lineHeight: "1.25rem",
                      whiteSpace: "nowrap",
                    }),
                    control: (baseStyles, state) => ({
                      ...baseStyles,
                      outline: "none",
                      borderColor: !!error
                        ? "#FDA29B"
                        : state.isFocused
                          ? "#007FFF"
                          : "#D0D5DD",
                      minHeight: 0,
                      height: "2.75rem",
                      cursor: "pointer",
                      fontSize: "1rem",
                      fontWeight: 400,
                      borderRadius: "0.5rem",
                      overflow: "hidden",
                      boxShadow: "0px 1px 2px 0px rgba(16, 24, 40, 0.05)",
                      "& .css-19bb58m": {
                        padding: 0,
                        margin: 0,
                      },
                      "& .css-9jq23d": {
                        padding: 0,
                        paddingRight: "0.625rem",
                        margin: 0,
                      },
                      "& .css-hlgwow": {
                        padding: 0,
                        margin: 0,
                      },
                      "& .css-1mjpsdc": {
                        padding: 0,
                        margin: 0,
                      },
                      "&:hover": {
                        borderColor: "#007FFF",
                      },
                    }),
                  }}
                  {...rest}
                />
              ) : type === "rich-text" ? (
                <TipTap
                  name={name}
                  value={value as string}
                  onChange={
                    onChange &&
                    (onChange as unknown as (event: SyntheticEvent) => void)
                  }
                  onBlur={
                    onBlur as unknown as (
                      event: FocusEvent<HTMLDivElement, Element>,
                    ) => void
                  }
                  error={error}
                  ref={ref}
                  richTextProps={richTextProps}
                  onImageUpload={
                    richTextProps?.image?.allowed
                      ? (file) => uploadImage(file, richTextProps.image!.folder)
                      : undefined
                  }
                  // placeholder={placeholder} maan, I dunno when I'mma come back for this fr
                  {...rest}
                />
              ) : type === "date" || type === "datetime-local" ? (
                // I'll be back for the 'date-only' version when I have more time
                <CustomDateTimePicker
                  name={name}
                  disabled={!!disabled}
                  placeholder={placeholder}
                  onBlur={onBlur}
                  onChange={onChange}
                  error={error}
                  value={value}
                  ref={ref}
                  {...rest}
                />
              ) : type === "tel" ? (
                <TelInputRender
                  name={name}
                  value={value as string}
                  onChange={
                    onChange as (e: {
                      target: { name?: string; value: string };
                    }) => void
                  }
                  placeholder={placeholder}
                  disabled={!!disabled}
                  error={error}
                />
              ) : (
                <input
                  id={name}
                  disabled={!!disabled}
                  name={name}
                  type={type === "password" && showPassword ? "text" : type}
                  placeholder={placeholder}
                  value={value as string}
                  onChange={onChange && onChange}
                  onBlur={onBlur && onBlur}
                  ref={ref}
                  className={`border outline-none ${
                    !!error
                      ? "border-[#FDA29B] text-[#F04438]"
                      : "border-[#D0D5DD] text-[#667085]"
                  } h-[2.75rem] w-full rounded-[0.5rem] bg-white p-[0.625rem_0.875rem] text-[1rem] font-[400] leading-[1.5rem] placeholder:font-[300] placeholder:opacity-[.7]`}
                  {...rest}
                />
              )}
              {type === "rich-text" && isUploadingImage && (
                <Icon
                  icon="svg-spinners:ring-resize"
                  className="absolute bottom-0 right-[0.875rem] translate-y-[-85%] text-[#007FFF] w-4 h-4"
                />
              )}
              {!!error &&
                type !== "email" &&
                type !== "password" &&
                type !== "date" &&
                type !== "datetime-local" &&
                type !== "multi-select" &&
                type !== "select" && (
                  <Icon
                    className="absolute bottom-0 right-[0.875rem] translate-y-[-85%]"
                    icon={"hugeicons:information-circle"}
                    color="#F04438"
                  />
                )}

              {type === "email" &&
                (!!error ? (
                  <Icon
                    className="absolute bottom-0 right-[0.875rem] translate-y-[-85%]"
                    icon={"hugeicons:information-circle"}
                    color="#F04438"
                  />
                ) : (
                  <Icon
                    className="absolute group-focus-within:text-[#007FFF] transition-all duration-[.4s] text-[#667085] bottom-0 right-[0.875rem] translate-y-[-85%]"
                    icon={"hugeicons:mail-01"}
                  />
                ))}
              {type === "password" && (
                <button
                  onClick={() =>
                    setVisibility((formerVisibility) => !formerVisibility)
                  }
                  type="button"
                  className="cursor-pointer"
                >
                  <Icon
                    height="1rem"
                    width="1rem"
                    className={`absolute bottom-0 right-[0.875rem] transition-all duration-[.4s] translate-y-[-85%] ${
                      !!error
                        ? "text-[#F04438]"
                        : "group-focus-within:text-[#007FFF] text-[#667085]"
                    }`}
                    icon={
                      !showPassword ? "hugeicons:view-off" : "hugeicons:view"
                    }
                  />
                </button>
              )}
            </div>
            {!!error && (
              <p className="text-[0.875rem] font-[400] leading-[1.25rem] text-[#F04438]">
                {error}
              </p>
            )}
          </div>
        );
    },
  ),
);

InputField.displayName = "InputField";

export { InputField };
