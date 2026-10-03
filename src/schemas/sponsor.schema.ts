import * as yup from "yup";

export const addStudentSchema = yup.object({
  firstName: yup.string().required("First name is required"),
  lastName: yup.string().required("Last name is required"),
  email: yup
    .string()
    .email("Invalid email address")
    .required("Email is required"),
  examTypeId: yup.string().required("Exam type is required"),
  countryCode: yup.string().optional(),
  phoneNumber: yup.string().optional(),
});

export const createSponsorUrlSchema = yup.object({
  label: yup.string().required("Label is required"),
  maxUses: yup
    .number()
    .transform((v, o) => (o === "" ? undefined : v))
    .min(1, "Must be at least 1")
    .optional(),
});

export const activateAccountSchema = yup.object({
  password: yup
    .string()
    .min(8, "Password must be at least 8 characters")
    .required("Password is required"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords do not match")
    .required("Confirm your password"),
});
