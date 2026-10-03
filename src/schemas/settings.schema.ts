import * as yup from "yup";

export const accountSchema = yup.object({
  firstName: yup.string().required("First name is required"),
  lastName: yup.string().required("Last name is required"),
  phone: yup.string().optional(),
});

export const passwordSchema = yup.object({
  currentPassword: yup.string().required("Current password is required"),
  newPassword: yup
    .string()
    .min(8, "Password must be at least 8 characters")
    .required("New password is required"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("newPassword")], "Passwords do not match")
    .required("Please confirm your new password"),
});

export type AccountFormData = yup.InferType<typeof accountSchema>;
export type PasswordFormData = yup.InferType<typeof passwordSchema>;
