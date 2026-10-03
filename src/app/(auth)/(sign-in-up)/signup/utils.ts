import { SelectOption } from "@/components/molecules";
import { IFormField, ICountry, IExamType } from "@/types";
import { capitalizeFirstLetter } from "@/utils";

const categoryOptions: SelectOption[] = [
  { value: "private-individuals", label: "Private Individuals" },
  { value: "religious-organizations", label: "Religious organizations" },
  { value: "company", label: "Company" },
  { value: "government-ngos", label: "Government and NGOs" },
];

/**
 * Generates form fields based on user type and live data from the store
 */
export function getFormFieldsByType(
  countries: ICountry[],
  examTypes: IExamType[],
): Record<"student" | "sponsor" | "affiliate", IFormField[]> {
  // Convert exam types to select options
  const examTypeOptions: SelectOption[] = examTypes.map((examType) => ({
    value: examType.id,
    label: examType.name,
  }));

  return {
    student: [
      {
        name: "firstName",
        type: "text",
        label: "First Name",
        placeholder: "John",
        gridColumn: "half",
      },
      {
        name: "lastName",
        type: "text",
        label: "Last Name",
        placeholder: "Doe",
        gridColumn: "half",
      },
      {
        name: "examTypeId",
        type: "select",
        label: "Exam Type",
        placeholder: "Select Exam Type",
        gridColumn: "full",
        selectOptions: examTypeOptions,
      },
      {
        name: "email",
        type: "email",
        label: "E-mail Address",
        placeholder: "Enter your e-mail address",
        gridColumn: "full",
      },
      {
        name: "phone",
        type: "tel",
        label: "Phone Number",
        placeholder: "801 234 5678",
        gridColumn: "full",
      },
      {
        name: "password",
        type: "password",
        label: "Password",
        placeholder: "Enter password",
        gridColumn: "full",
      },
      {
        name: "confirmPassword",
        type: "password",
        label: "Confirm Password",
        placeholder: "Confirm password",
        gridColumn: "full",
      },
    ],
    sponsor: [
      {
        name: "firstName",
        type: "text",
        label: "First Name",
        placeholder: "John",
        gridColumn: "half",
      },
      {
        name: "lastName",
        type: "text",
        label: "Last Name",
        placeholder: "Doe",
        gridColumn: "half",
      },
      {
        name: "category",
        type: "select",
        label: "Category",
        placeholder: "Select Category",
        gridColumn: "full",
        selectOptions: categoryOptions.map((option) => ({
          ...option,
          label: capitalizeFirstLetter(option.label),
        })),
      },
      {
        name: "companyName",
        type: "text",
        label: "Company Name",
        placeholder: "Enter your company name",
        gridColumn: "full",
        conditionalOn: { field: "category", value: "company" },
      },
      {
        name: "email",
        type: "email",
        label: "E-mail Address",
        placeholder: "Enter your e-mail address",
        gridColumn: "full",
      },
      {
        name: "phone",
        type: "tel",
        label: "Phone Number",
        placeholder: "801 234 5678",
        gridColumn: "full",
      },
      {
        name: "password",
        type: "password",
        label: "Password",
        placeholder: "Enter password",
        gridColumn: "full",
      },
      {
        name: "confirmPassword",
        type: "password",
        label: "Confirm Password",
        placeholder: "Confirm password",
        gridColumn: "full",
      },
    ],
    affiliate: [
      {
        name: "firstName",
        type: "text",
        label: "First Name",
        placeholder: "John",
        gridColumn: "half",
      },
      {
        name: "lastName",
        type: "text",
        label: "Last Name",
        placeholder: "Doe",
        gridColumn: "half",
      },
      {
        name: "email",
        type: "email",
        label: "E-mail Address",
        placeholder: "Enter your e-mail address",
        gridColumn: "full",
      },
      {
        name: "phone",
        type: "tel",
        label: "Phone Number",
        placeholder: "801 234 5678",
        gridColumn: "full",
      },
      {
        name: "password",
        type: "password",
        label: "Password",
        placeholder: "Enter password",
        gridColumn: "full",
      },
      {
        name: "confirmPassword",
        type: "password",
        label: "Confirm Password",
        placeholder: "Confirm password",
        gridColumn: "full",
      },
    ],
  };
}
