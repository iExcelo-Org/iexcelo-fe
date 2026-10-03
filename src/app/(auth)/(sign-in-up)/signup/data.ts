import { SelectOption } from "@/components/molecules";
import { IFormField, SponsorCategory } from "@/types";

export const categoryOptions: SelectOption[] = [
  { value: SponsorCategory.INDIVIDUAL, label: "Private Individual" },
  { value: SponsorCategory.COMPANY, label: "Company" },
  { value: SponsorCategory.RELIGIOUS, label: "Religious Organization" },
  { value: SponsorCategory.GOVERNMENT, label: "Government / NGO" },
];

const examTypes: SelectOption[] = [
  { value: "waec", label: "WAEC" },
  { value: "jamb", label: "JAMB" },
  { value: "post-jamb", label: "Post JAMB" },
  { value: "sat", label: "SAT" },
];

const countryCodeOptions: SelectOption[] = [
  { value: "+234", label: "+234" },
  { value: "+1", label: "+1" },
  { value: "+44", label: "+44" },
  { value: "+91", label: "+91" },
];

export const formFieldsByType: Record<
  "student" | "sponsor" | "affiliate",
  IFormField[]
> = {
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
      name: "examtype",
      type: "select",
      label: "Exam Type",
      placeholder: "Select Exam Type",
      gridColumn: "full",
      selectOptions: examTypes,
    },
    {
      name: "email",
      type: "email",
      label: "E-mail Address",
      placeholder: "Enter your e-mail address",
      gridColumn: "full",
    },
    {
      name: "phoneNumber",
      type: "tel",
      label: "Phone Number",
      placeholder: "Enter your phone number",
      gridColumn: "full",
      selectOptions: countryCodeOptions,
      telProps: {
        inputProps: {
          name: "phoneNumber",
          placeholder: "Enter your phone number",
        },
        selectProps: {
          name: "countryCode",
          placeholder: "+234",
        },
      },
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
      selectOptions: categoryOptions,
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
      name: "phoneNumber",
      type: "tel",
      label: "Phone Number",
      placeholder: "Enter your phone number",
      gridColumn: "full",
      selectOptions: countryCodeOptions,
      telProps: {
        inputProps: {
          name: "phoneNumber",
          placeholder: "Enter your phone number",
        },
        selectProps: {
          name: "countryCode",
          placeholder: "+234",
        },
      },
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
      name: "phoneNumber",
      type: "tel",
      label: "Phone Number",
      placeholder: "Enter your phone number",
      gridColumn: "full",
      selectOptions: countryCodeOptions,
      telProps: {
        inputProps: {
          name: "phoneNumber",
          placeholder: "Enter your phone number",
        },
        selectProps: {
          name: "countryCode",
          placeholder: "+234",
        },
      },
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
