import { AxiosError } from "axios";
import { toast } from "sonner";

export const handleAxiosError = (error: unknown, fallback: string) => {
  const axiosError = error as AxiosError<{
    message?: string;
    errors?: { msg: string }[];
  }>;
  const msg =
    axiosError.response?.data?.message ||
    axiosError.response?.data?.errors?.[0]?.msg ||
    fallback;
  toast.error(msg);
};
