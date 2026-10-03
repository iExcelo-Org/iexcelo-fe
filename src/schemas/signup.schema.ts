import * as yup from "yup";
import { SponsorCategory } from "@/types";

export const studentSchema = yup.object().shape({
  firstName: yup.string().required("First name is required"),
  lastName: yup.string().required("Last name is required"),
  examTypeId: yup.string().required("Please select an exam type"),
  email: yup
    .string()
    .email("Invalid email address")
    .required("Email is required"),
  phone: yup.string().required("Phone number is required"),
  password: yup
    .string()
    .min(8, "Password must be at least 8 characters")
    .required("Password is required"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords must match")
    .required("Confirm password is required"),
  agreeToTerms: yup.boolean().required("You must agree to the terms").oneOf([true], "You must agree to the terms"),
});

export const sponsorSchema = yup.object().shape({
  firstName: yup.string().required("First name is required"),
  lastName: yup.string().required("Last name is required"),
  category: yup.string().required("Category is required"),
  companyName: yup.string().when("category", {
    is: SponsorCategory.COMPANY,
    then: (schema) => schema.required("Company name is required"),
    otherwise: (schema) => schema.optional(),
  }),
  email: yup
    .string()
    .email("Invalid email address")
    .required("Email is required"),
  phone: yup.string().required("Phone number is required"),
  password: yup
    .string()
    .min(8, "Password must be at least 8 characters")
    .required("Password is required"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords must match")
    .required("Confirm password is required"),
  agreeToTerms: yup.boolean().required("You must agree to the terms").oneOf([true], "You must agree to the terms"),
});

export const affiliateSchema = yup.object().shape({
  firstName: yup.string().required("First name is required"),
  lastName: yup.string().required("Last name is required"),
  email: yup
    .string()
    .email("Invalid email address")
    .required("Email is required"),
  phone: yup.string().required("Phone number is required"),
  password: yup
    .string()
    .min(8, "Password must be at least 8 characters")
    .required("Password is required"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords must match")
    .required("Confirm password is required"),
  agreeToTerms: yup.boolean().required("You must agree to the terms").oneOf([true], "You must agree to the terms"),
});
