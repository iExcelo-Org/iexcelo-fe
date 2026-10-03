// UI-related types for forms and components

export type SelectOption = {
  value: string | number | null;
  label: string;
};

export interface NavItem {
  name: string;
  icon: string;
  href: string;
}

export type DashboardNavItem = {
  name: string;
  icon: string;
  href: string;
  children?: DashboardNavItem[]; // For accordion items
};

export interface ITelProps {
  inputProps?: {
    name?: string;
    placeholder?: string;
  };
  selectProps?: {
    name?: string;
    placeholder?: string;
  };
}

export interface IFormField {
  name: string;
  type: "text" | "email" | "password" | "tel" | "select";
  label: string;
  placeholder: string;
  gridColumn?: "half" | "full";
  selectOptions?: SelectOption[];
  telProps?: ITelProps;
  conditionalOn?: { field: string; value: string };
}
