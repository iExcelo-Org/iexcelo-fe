"use client";

import React, { useEffect, useMemo, useState, Suspense } from "react";
import { useForm, type FieldErrors, type FieldError } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { defaultCountries, parseCountry } from "react-international-phone";
import { InputField } from "@/components/molecules";
import { affiliateSchema, sponsorSchema, studentSchema } from "@/schemas";
import {
  IFormField,
  RegistrationFormDataTypes,
  SignUpFieldNameTypes,
  UserType,
} from "@/types";
import { getFormFieldsByType } from "./utils";
import { AnyObjectSchema } from "yup";
import { Icon } from "@iconify/react";
import { Button, CheckBox, Radio, SVGClient } from "@/components/atoms";
import Link from "next/link";
import { useAuthStore, useUtilsStore } from "@/store";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

const SignUpInner = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState<1 | 2>(1);

  const { initGoogle, userType, setUserType, signup, hydrated } =
    useAuthStore();

  // Capture referral code from URL (?ref=AFF-xxx) and persist to localStorage
  useEffect(() => {
    const ref = searchParams.get("ref");
    if (ref) {
      localStorage.setItem("referralCode", ref);
    }
  }, [searchParams]);

  // Capture sponsor code (?sponsor=CODE) — auto-select student and skip step 1
  useEffect(() => {
    const sponsor = searchParams.get("sponsor");
    if (sponsor) {
      localStorage.setItem("sponsorCode", sponsor);
      setUserType(UserType.STUDENT);
      setStep(2);
    }
  }, [searchParams, setUserType]);

  const { countries, examTypes } = useUtilsStore();

  const formFieldsByType = useMemo(
    () => getFormFieldsByType(countries, examTypes),
    [countries, examTypes],
  );

  const schema = useMemo(() => {
    switch (userType) {
      case UserType.STUDENT:
        return studentSchema;
      case UserType.SPONSOR:
        return sponsorSchema;
      case UserType.AFFILIATE:
        return affiliateSchema;
      default:
        return studentSchema;
    }
  }, [userType]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema as AnyObjectSchema),
    mode: "onChange",
  });

  const handleUserTypeSelect = (type: UserType) => {
    setUserType(type);
  };

  const handleGoBack = () => {
    setStep(1);
    setUserType(null);
  };

  const onFormError = (errs: FieldErrors) => {
    if (errs.agreeToTerms) {
      toast.error(
        (errs.agreeToTerms as FieldError).message ??
          "You must agree to the terms",
      );
    }
  };

  const onSubmit = async (data: RegistrationFormDataTypes) => {
    if (!userType) return;

    // Parse combined phone "+2348012345678" → countryCode + phoneNumber
    const phone = (data as any).phone as string | undefined;
    let countryCode = "";
    let phoneNumber = phone ?? "";
    if (phone?.startsWith("+")) {
      const opts = defaultCountries.map((raw) => {
        const { dialCode } = parseCountry(raw);
        return { dialCode };
      });
      const match = opts.find((c) => phone.startsWith(`+${c.dialCode}`));
      if (match) {
        countryCode = `+${match.dialCode}`;
        phoneNumber = phone.slice(match.dialCode.length + 1);
      }
    }

    await signup(
      {
        ...(data as RegistrationFormDataTypes),
        userType,
        phoneNumber,
        countryCode,
      } as any,
      () => {
        router.push("/verify-email");
      },
    );
  };

  const renderFormFields = () => {
    if (!userType) return null;

    const allFields = formFieldsByType[userType];

    // Filter out conditional fields that don't meet their condition
    const fields = allFields.filter((field) => {
      if (!field.conditionalOn) return true;
      const { field: condField, value: condValue } = field.conditionalOn;
      return watch(condField as SignUpFieldNameTypes) === condValue;
    });

    const groupedFields: IFormField[][] = [];
    let currentGroup: IFormField[] = [];

    fields.forEach((field) => {
      if (field.gridColumn === "half") {
        currentGroup.push(field);
        if (currentGroup.length === 2) {
          groupedFields.push([...currentGroup]);
          currentGroup = [];
        }
      } else {
        if (currentGroup.length > 0) {
          groupedFields.push([...currentGroup]);
          currentGroup = [];
        }
        groupedFields.push([field]);
      }
    });

    if (currentGroup.length > 0) {
      groupedFields.push(currentGroup);
    }

    return groupedFields.map((group, groupIndex) => {
      const renderField = (field: IFormField) => {
        const fieldError = errors[field.name as SignUpFieldNameTypes]
          ?.message as string | undefined;
        if (field.type === "tel") {
          return (
            <InputField
              key={field.name}
              type="tel"
              label={field.label}
              placeholder={field.placeholder}
              value={
                (watch(field.name as SignUpFieldNameTypes) as string) ?? ""
              }
              onChange={(
                e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
              ) =>
                setValue(field.name as SignUpFieldNameTypes, e.target.value, {
                  shouldDirty: true,
                  shouldValidate: true,
                })
              }
              error={fieldError}
            />
          );
        }
        return (
          <InputField
            key={field.name}
            type={field.type}
            label={field.label}
            placeholder={field.placeholder}
            selectOptions={field.selectOptions}
            error={fieldError}
            {...register(field.name as SignUpFieldNameTypes)}
          />
        );
      };

      if (group.length === 2 && group[0].gridColumn === "half") {
        return (
          <div
            key={groupIndex}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            {group.map(renderField)}
          </div>
        );
      }
      return group.map(renderField);
    });
  };

  // TODO: Add a skeleton in coming years
  if (!hydrated) return null;

  // Step 1: User Type Selection
  if (step === 1) {
    return (
      <div>
        <div className="mb-[2rem] sm:mb-[3rem]">
          <h1 className="mb-[.5rem] text-[1.35rem] sm:text-[1.75rem] md:text-[2rem] font-[600] text-[#2B2B2B] tracking-[-.64px] leading-[1.75rem] sm:leading-[2.5rem]">
            How will you like to use iExcelo?
          </h1>
          <p className="text-[.875rem] sm:text-[1.125rem] leading-[1.5rem] sm:leading-[1.75rem] font-[400] text-[#757575]">
            Lets get you started.
          </p>
        </div>

        <div className="space-y-[.75rem] sm:space-y-[1rem] mb-[1.5rem] sm:mb-[2rem]">
          {[
            {
              icon: "hugeicons:mortarboard-01",
              userType: "student" as const,
              title: "I am a student",
            },
            {
              icon: "hugeicons:healtcare",
              userType: "sponsor" as const,
              title: "I want to become a sponsor",
            },
            {
              icon: "hugeicons:affiliate",
              userType: "affiliate" as const,
              title: "I want join as an affiliate",
            },
          ]?.map((buttonContents, index) => (
            <button
              key={`__button__${index}`}
              type="button"
              onClick={() =>
                handleUserTypeSelect(buttonContents?.userType as UserType)
              }
              style={{
                boxShadow:
                  "0 0 0 1px rgba(0, 0, 0, 0.06), 0 5px 22px 0 rgba(0, 0, 0, 0.04)",
              }}
              className={`flex w-full items-center justify-between rounded-[1.75rem] bg-white p-[.875rem_1.25rem] sm:p-[1.5rem_2rem] cursor-pointer duration-[.4s] transition-all`}
            >
              <div className="flex items-center gap-[.625rem]">
                <div
                  className={`${
                    userType === buttonContents?.userType
                      ? "bg-[#E6F2FF] text-[#007FFF]"
                      : "bg-[#F3F3F3] text-[#101928]"
                  } flex p-[.5rem] sm:p-[.75rem] rounded-[50%] transition-all duration-[.4s] items-center justify-center`}
                >
                  <Icon
                    height={"1.25rem"}
                    width={"1.25rem"}
                    color="inherit"
                    icon={buttonContents?.icon}
                  />
                </div>
                <span className="text-[.875rem] sm:text-[1.25rem] text-left tracking-[-.4px] leading-[1.5rem] sm:leading-[1.75rem] font-[500] text-[#2B2B2B]">
                  {buttonContents?.title}
                </span>
              </div>
              <div>
                <Radio
                  value={userType === buttonContents?.userType}
                  name={buttonContents?.userType}
                />
              </div>
            </button>
          ))}
        </div>

        <Button
          disabled={!userType}
          onClick={() => {
            if (!!userType) {
              setStep(2);
            }
          }}
          className="w-[10.625rem] justify-center"
        >
          Continue
        </Button>

        <div className="mt-[3rem] mx-auto p-[1rem_1.75rem] w-fit rounded-[1.875rem] bg-white text-[.875rem] leading-[1.25rem] font-[400] text-[#454545]">
          <span>Already have an account? </span>
          <Link
            href="/login"
            className="font-[600] text-[#007FFF] hover:underline"
          >
            Log in
          </Link>
        </div>
      </div>
    );
  }

  // Step 2: Registration Form
  return (
    <div>
      <button
        onClick={handleGoBack}
        className="mb-[1.5rem] flex items-center font-[600] leading-[1.25rem] text-[0.875rem] gap-[.5rem] cursor-pointer text-[#2B2B2B] hover:text-gray-900"
      >
        <Icon
          icon={"hugeicons:arrow-left-02"}
          height={"1.25rem"}
          width={"1.25rem"}
          color="inherit"
        />
        Go Back
      </button>

      <div
        style={{
          boxShadow:
            "0 3px 2px -2px rgba(235, 80, 23, 0.06), 0 5px 3px -2px rgba(235, 80, 23, 0.02)",
        }}
        className="rounded-[1rem] bg-white p-[1.25rem_1rem] sm:p-[2.5rem_2rem]"
      >
        <h2 className="mb-[1.5rem] sm:mb-[2rem] leading-[1.75rem] sm:leading-[2rem] text-center text-[1.25rem] sm:text-[1.5rem] font-[600] tracking-[-.48px] text-[#2B2B2B]">
          Create an account to continue
        </h2>

        <form
          onSubmit={handleSubmit(onSubmit, onFormError)}
          className="flex flex-col gap-y-[1rem]"
        >
          <button
            type="button"
            onClick={() => initGoogle()}
            className="flex w-full items-center justify-center gap-[1rem] rounded-[0.375rem] border-[1.5px] border-[#D0D5DD] bg-white p-[1rem] cursor-pointer transition-all hover:bg-gray-50"
          >
            <SVGClient src="/svg/google.svg" />
            <span className="font-[600] text-[.875rem] sm:text-[1rem] leading-[1.5rem] text-[#2B2B2B]">
              Continue with Google
            </span>
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#F0F2F5]" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-[.5rem] tracking-[1px] font-[600] uppercase text-[.875rem] leading-[1.25rem] text-[#2B2B2B]">
                OR
              </span>
            </div>
          </div>

          {renderFormFields()}

          <div>
            <CheckBox
              onChange={(status) => setValue("agreeToTerms", status)}
              value={watch("agreeToTerms")}
              customLabel={
                <span className="text-[.875rem] leading-[1.25rem] font-[400] ml-[.75rem] text-[#2B2B2B]">
                  I agree to the{" "}
                  <Link href="#" className="text-[#007FFF] hover:underline">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="#" className="text-[#007FFF] hover:underline">
                    Privacy Policy
                  </Link>
                </span>
              }
            />
          </div>

          <div className="mt-[1rem]">
            <Button loading={isSubmitting} className="w-full justify-center">
              Submit
            </Button>
          </div>
        </form>
      </div>
      <div className="mt-[2.5rem] mx-auto p-[1rem_1.75rem] w-fit rounded-[1.875rem] bg-white text-[.875rem] leading-[1.25rem] font-[400] text-[#454545]">
        <span>Already have an account? </span>
        <Link
          href="/login"
          className="font-[600] text-[#007FFF] hover:underline"
        >
          Log in
        </Link>
      </div>
    </div>
  );
};

function SignUp() {
  return (
    <Suspense>
      <SignUpInner />
    </Suspense>
  );
}

export default SignUp;
