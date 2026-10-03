/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useEffect, useMemo, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useAuthStore, useUtilsStore } from "@/store";
import { InputField } from "@/components/molecules";
import { Button, Radio } from "@/components/atoms";
import { UserType, SponsorCategory } from "@/types";
import type { ISubject, IExamType, OnboardingFormData } from "@/types";
import { capitalizeFirstLetter } from "@/utils";
import { toast } from "sonner";
import { createOnboardingSchema } from "@/schemas";
import { categoryOptions } from "../../(sign-in-up)/signup/data";
import { Icon } from "@iconify/react";

function OnboardingPageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { hydrated, userType, completeOnboarding, setTempToken } =
    useAuthStore();
  const { examTypes, subjects, fetchSubjectsByExamType } = useUtilsStore();

  const token = useMemo(() => searchParams.get("token") || "", [searchParams]);

  // Local selected user type (for when store userType is null)
  const [selectedUserType, setSelectedUserType] = useState<UserType | null>(
    userType,
  );

  const [selectedSubjectsString, setSelectedSubjectsString] = useState("");
  const [compulsoryIds, setCompulsoryIds] = useState<string[]>([]);
  const [loadingSubjects, setLoadingSubjects] = useState(false);

  // Create schema dynamically based on selectedUserType
  const validationSchema = useMemo(
    () => createOnboardingSchema(selectedUserType || UserType.STUDENT),
    [selectedUserType],
  );

  const {
    control,
    handleSubmit: handleFormSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<OnboardingFormData>({
    resolver: yupResolver(validationSchema) as any,
    defaultValues: {
      examTypeId: "",
      subjectIds: [],
      category: "",
      companyName: "",
    },
  });

  const examTypeId = watch("examTypeId");
  const subjectIds = watch("subjectIds");

  // Get selected exam type for validation helper text
  const selectedExamType = useMemo(() => {
    if (!examTypeId) return null;
    return examTypes.find((et) => et.id === examTypeId);
  }, [examTypeId, examTypes]);

  // If no token, just send them to signup page
  // If token exists, save it to the store for the interceptor
  useEffect(() => {
    if (!token) {
      router.replace("/signup");
    } else {
      setTempToken(token);
    }
  }, [token]);

  // Fetch subjects when exam type changes; auto-select + lock compulsory ones
  useEffect(() => {
    if (!examTypeId) return;
    setLoadingSubjects(true);
    setCompulsoryIds([]);
    setSelectedSubjectsString("");
    setValue("subjectIds", []);
    void fetchSubjectsByExamType(examTypeId)
      .then((fetched) => {
        const ids = fetched.filter((s) => s.isCompulsory).map((s) => s.id);
        setCompulsoryIds(ids);
        if (ids.length > 0) {
          setSelectedSubjectsString(ids.join(","));
          setValue("subjectIds", ids);
        }
      })
      .finally(() => setLoadingSubjects(false));
  }, [examTypeId]);

  useEffect(() => {
    if (userType) {
      setSelectedUserType(userType);
    }
  }, [userType]);

  const onSubmit = async (data: OnboardingFormData) => {
    if (!selectedUserType) {
      toast.error("Please select how you want to use iExcelo");
      return;
    }

    // Additional validation for min/max subjects (student only)
    if (selectedExamType && selectedUserType === UserType.STUDENT) {
      const selectedCount = data.subjectIds?.length || 0;
      const { minSubjectsSelectable, maxSubjectsSelectable } = selectedExamType;

      if (selectedCount < minSubjectsSelectable) {
        toast.error(
          `Please select at least ${minSubjectsSelectable} subject${minSubjectsSelectable > 1 ? "s" : ""}`,
        );
        return;
      }

      if (selectedCount > maxSubjectsSelectable) {
        toast.error(
          `Please select at most ${maxSubjectsSelectable} subject${maxSubjectsSelectable > 1 ? "s" : ""}`,
        );
        return;
      }
    }

    const payload: any = {
      userType: selectedUserType,
    };

    if (selectedUserType === UserType.STUDENT) {
      payload.examTypeId = data.examTypeId;
      payload.subjectIds = data.subjectIds;
    } else if (selectedUserType === UserType.SPONSOR) {
      payload.sponsorType = data.category;
      if (data.companyName) {
        payload.companyName = data.companyName;
      }
    }

    await completeOnboarding(payload, (role) => {
      if (role === UserType.STUDENT) {
        router.replace("/student");
      } else if (role === UserType.SPONSOR) {
        router.replace("/sponsor");
      } else if (role === UserType.AFFILIATE) {
        router.replace("/affiliates");
      } else {
        // Should never happen but just in case
        toast.error("Invalid user type, please try again!");
        router.replace("/");
      }
    });
  };

  //  TODO: Change to skeleton in coming years
  if (!hydrated || !token) {
    return null;
  }

  // User type selection options
  const userTypeOptions = [
    {
      icon: "hugeicons:mortarboard-01",
      userType: UserType.STUDENT,
      title: "I am a student",
    },
    {
      icon: "hugeicons:healtcare",
      userType: UserType.SPONSOR,
      title: "I want to become a sponsor",
    },
    {
      icon: "hugeicons:affiliate",
      userType: UserType.AFFILIATE,
      title: "I want to join as an affiliate",
    },
  ];

  return (
    <div
      style={{
        boxShadow:
          "0 3px 2px -2px rgba(235, 80, 23, 0.06), 0 5px 3px -2px rgba(235, 80, 23, 0.02)",
      }}
      className="rounded-[1rem] max-w-[38rem] w-[95%] mx-auto bg-white p-[1.25rem_1rem] sm:p-[2.5rem_2rem]"
    >
      <h2 className="mb-[.5rem] leading-[1.75rem] sm:leading-[2rem] text-[1.25rem] sm:text-[1.5rem] font-[600] tracking-[-.48px] text-[#2B2B2B]">
        Let&apos;s complete your setup
      </h2>
      <p className="text-[.8125rem] sm:text-[.875rem] leading-[1.5rem] text-[#667085] mb-[1.5rem] sm:mb-[2rem]">
        We&apos;ll ask a few quick questions so we can personalise your iExcelo
        experience.
      </p>

      <form
        onSubmit={handleFormSubmit(onSubmit)}
        className="flex flex-col gap-y-[1rem]"
      >
        {/* User Type Picker - show if no userType is set and no selectedUserType is set */}
        {!userType && !selectedUserType && (
          <div className="space-y-[1rem] mb-[1rem]">
            <label className="block text-[.875rem] font-[500] text-[#344054]">
              How will you like to use iExcelo?
            </label>
            {userTypeOptions.map((option) => (
              <button
                key={option.userType}
                type="button"
                onClick={() => setSelectedUserType(option.userType)}
                style={{
                  boxShadow:
                    "0 0 0 1px rgba(0, 0, 0, 0.06), 0 5px 22px 0 rgba(0, 0, 0, 0.04)",
                }}
                className="flex w-full items-center justify-between rounded-[1.75rem] bg-white p-[.875rem_1.25rem] sm:p-[1.5rem_2rem] cursor-pointer duration-[.4s] transition-all"
              >
                <div className="flex items-center gap-[.625rem]">
                  <div
                    className={`${
                      selectedUserType === option.userType
                        ? "bg-[#E6F2FF] text-[#007FFF]"
                        : "bg-[#F3F3F3] text-[#101928]"
                    } flex p-[.5rem] sm:p-[.75rem] rounded-[50%] transition-all duration-[.4s] items-center justify-center`}
                  >
                    <Icon
                      height="1.25rem"
                      width="1.25rem"
                      color="inherit"
                      icon={option.icon}
                    />
                  </div>
                  <span className="text-[.875rem] sm:text-[1.125rem] text-left tracking-[-.4px] leading-[1.5rem] sm:leading-[1.75rem] font-[500] text-[#2B2B2B]">
                    {option.title}
                  </span>
                </div>
                <Radio
                  value={selectedUserType === option.userType}
                  name={option.userType}
                />
              </button>
            ))}
          </div>
        )}

        {/* Show Account Type only if userType was already set (from signup) */}
        {selectedUserType && (
          <InputField
            label="Account Type"
            value={capitalizeFirstLetter(selectedUserType)}
            disabled
          />
        )}

        {selectedUserType === UserType.STUDENT && (
          <>
            <Controller
              name="examTypeId"
              control={control}
              render={({ field }) => (
                <InputField
                  type="select"
                  label="Exam Type"
                  placeholder="Select your exam type"
                  value={field.value}
                  selectOptions={examTypes.map((examType: IExamType) => ({
                    value: examType.id,
                    label: examType.name,
                  }))}
                  onChange={(e: { target: { name?: string; value: any } }) => {
                    setSelectedSubjectsString("");
                    setValue("subjectIds", []);
                    field.onChange(e.target.value);
                  }}
                  error={errors.examTypeId?.message}
                />
              )}
            />

            {examTypeId && (
              <div>
                <Controller
                  name="subjectIds"
                  control={control}
                  render={({ field }) => (
                    <InputField
                      type="multi-select"
                      label="Subjects"
                      placeholder={
                        loadingSubjects
                          ? "Loading subjects..."
                          : "Select your subjects"
                      }
                      value={selectedSubjectsString}
                      selectOptions={subjects.map((subject: ISubject) => ({
                        value: subject.id,
                        label: subject.isCompulsory
                          ? `${subject.name} (required)`
                          : subject.name,
                      }))}
                      disabled={loadingSubjects}
                      onChange={(e: {
                        target: { name?: string; value: any };
                      }) => {
                        const value = e.target.value;
                        const ids = value
                          .split(",")
                          .map((id: string) => id.trim())
                          .filter(Boolean);
                        // Always keep compulsory subjects selected
                        const merged = [...new Set([...compulsoryIds, ...ids])];
                        setSelectedSubjectsString(merged.join(","));
                        field.onChange(merged);
                      }}
                      error={errors.subjectIds?.message}
                    />
                  )}
                />
                {selectedExamType && (
                  <p className="mt-1.5 text-xs text-[#667085]">
                    Select between {selectedExamType.minSubjectsSelectable} and{" "}
                    {selectedExamType.maxSubjectsSelectable} subjects (
                    {subjectIds?.length ?? 0} selected)
                  </p>
                )}
              </div>
            )}
          </>
        )}

        {selectedUserType === UserType.SPONSOR && (
          <>
            <Controller
              name="category"
              control={control}
              render={({ field }) => (
                <InputField
                  type="select"
                  label="Category"
                  placeholder="Select your category"
                  value={field.value}
                  selectOptions={categoryOptions}
                  onChange={(e: { target: { name?: string; value: any } }) => {
                    field.onChange(e.target.value);
                  }}
                  error={errors.category?.message}
                />
              )}
            />

            {watch("category") === SponsorCategory.COMPANY && (
              <Controller
                name="companyName"
                control={control}
                render={({ field }) => (
                  <InputField
                    type="text"
                    label="Company Name"
                    placeholder="Enter your company name"
                    value={field.value}
                    onChange={(e: {
                      target: { name?: string; value: any };
                    }) => {
                      field.onChange(e.target.value);
                    }}
                    error={errors.companyName?.message}
                  />
                )}
              />
            )}
          </>
        )}

        {selectedUserType === UserType.AFFILIATE && (
          <p className="text-[.875rem] leading-[1.5rem] text-[#667085]">
            Your affiliate account is ready! Click continue to access your
            dashboard and start earning commissions.
          </p>
        )}

        <div className="mt-[1rem]">
          <Button
            type="submit"
            loading={isSubmitting}
            disabled={!selectedUserType}
            className="w-full justify-center"
          >
            Continue to dashboard
          </Button>
        </div>
      </form>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense>
      <OnboardingPageInner />
    </Suspense>
  );
}
