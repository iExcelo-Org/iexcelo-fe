/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useEffect } from "react";
import { useUtilsStore } from "@/store/utils.store";
import type { ICountry, IExamType } from "@/types";

interface UtilsInitializerProps {
  countries: ICountry[];
  examTypes: IExamType[];
}

export default function UtilsInitializer({
  countries,
  examTypes,
}: UtilsInitializerProps) {
  const setCountries = useUtilsStore((state) => state.setCountries);
  const setExamTypes = useUtilsStore((state) => state.setExamTypes);

  useEffect(() => {
    if (countries && !!countries.length) {
      setCountries(countries);
    }
  }, [countries]);

  useEffect(() => {
    if (examTypes && !!examTypes.length) {
      setExamTypes(examTypes);
    }
  }, [examTypes]);

  return null;
}
