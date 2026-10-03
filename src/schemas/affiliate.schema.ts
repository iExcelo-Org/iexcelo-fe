import * as yup from "yup";

export const affiliateCodeSchema = yup.object().shape({
  affiliateCode: yup
    .string()
    .required("Affiliate code is required")
    .min(4, "Must be at least 4 characters")
    .max(30, "Must be at most 30 characters")
    .matches(
      /^[a-zA-Z0-9-]+$/,
      "Only letters, numbers, and hyphens are allowed",
    ),
});
