import * as yup from "yup";

export const passwordResetInitSchema = yup.object().shape({
  email: yup
    .string()
    .email("Invalid email address")
    .required("Email is required"),
});

export const passwordResetConfirmSchema = yup.object().shape({
  password: yup
    .string()
    .min(8, "Password must be at least 8 characters")
    .required("Password is required"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords must match")
    .required("Confirm password is required"),
});

export type PasswordResetInitFormData = yup.InferType<
  typeof passwordResetInitSchema
>;
export type PasswordResetConfirmFormData = yup.InferType<
  typeof passwordResetConfirmSchema
>;
