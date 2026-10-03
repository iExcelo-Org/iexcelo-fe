import type { ICountry, IExamType } from "@/types";
import UtilsInitializer from "./UtilsInitializer";
import { API_URL, API_KEY } from "@/utils";

export const dynamic = "force-dynamic";

async function fetchCountries(): Promise<ICountry[]> {
  try {
    const response = await fetch(`${API_URL}/utils/countries`, {
      headers: {
        "X-API-Key": API_KEY,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return [];
    }

    const result = await response.json();

    return result?.data || [];
  } catch {
    return [];
  }
}

async function fetchExamTypes(): Promise<IExamType[]> {
  try {
    const response = await fetch(`${API_URL}/exams/types`, {
      headers: {
        "X-API-Key": API_KEY,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return [];
    }

    const result = await response.json();
    return result?.data || [];
  } catch {
    return [];
  }
}

export default async function UtilsProvider() {
  const [countries, examTypes] = await Promise.all([
    fetchCountries(),
    fetchExamTypes(),
  ]);

  return <UtilsInitializer countries={countries} examTypes={examTypes} />;
}
