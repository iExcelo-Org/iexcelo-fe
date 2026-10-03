import * as yup from "yup";
import { UserType, SponsorCategory } from "@/types";

// Unified onboarding schema that validates based on userType
export const createOnboardingSchema = (userType: UserType) => {
  const baseSchema = yup.object().shape({
    userType: yup
      .string()
      .oneOf([UserType.STUDENT, UserType.SPONSOR, UserType.AFFILIATE]),
  });

  switch (userType) {
    case UserType.STUDENT:
      return baseSchema.shape({
        examTypeId: yup.string().required("Please select an exam type"),
        subjectIds: yup
          .array()
          .of(yup.string().required())
          .min(1, "Please select at least one subject")
          .required("Please select subjects"),
      });

    case UserType.SPONSOR:
      return baseSchema.shape({
        category: yup.string().required("Please select a category"),
        companyName: yup.string().when("category", {
          is: SponsorCategory.COMPANY,
          then: (schema) => schema.required("Company name is required"),
          otherwise: (schema) => schema.optional(),
        }),
      });

    default:
      return baseSchema;
  }
};

// Legacy export for backward compatibility
export const studentOnboardingSchema = createOnboardingSchema(UserType.STUDENT);
