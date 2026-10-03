"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { InputField, Modal } from "@/components/molecules";
import { Button } from "@/components/atoms";
import { CARD_SHADOW, CURRENCY_SYMBOLS } from "@/utils";
import { useAffiliateStore, useAuthStore } from "@/store";
import { IPayoutAccount } from "@/types";

function fmt(amount: number, currency: string) {
  const sym = CURRENCY_SYMBOLS[currency] ?? currency + " ";
  return `${sym}${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// ─── Inline withdrawal form ───────────────────────────────────────────────────

function WithdrawForm({
  currency,
  available,
  accounts,
  onClose,
  onSubmit,
  isWithdrawing,
}: {
  currency: string;
  available: number;
  accounts: IPayoutAccount[];
  onClose: () => void;
  onSubmit: (amount: number, payoutAccountId: string) => void;
  isWithdrawing: boolean;
}) {
  const currencyAccounts = accounts.filter((a) => a.currency === currency);
  const defaultAccount = currencyAccounts.find((a) => a.isDefault) ?? currencyAccounts[0];
  const [selectedAccountId, setSelectedAccountId] = useState(defaultAccount?.id ?? "");

  const accountOptions = currencyAccounts.map((a) => ({
    value: a.id,
    label: `${a.bankName} — ${a.accountNumber}${a.isDefault ? " (Default)" : ""}`,
  }));

  const schema = useMemo(
    () =>
      yup.object({
        amount: yup
          .number()
          .typeError("Enter a valid amount")
          .required("Amount is required")
          .positive("Amount must be greater than 0")
          .max(available, `Cannot exceed ${fmt(available, currency)}`),
      }),
    [available, currency],
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<{ amount: number }>({
    resolver: yupResolver(schema) as any,
    mode: "onChange",
  });

  if (currencyAccounts.length === 0) {
    return (
      <div className="mt-3 p-4 rounded-[.75rem] border border-[#D0D5DD] bg-[#F9FAFB]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[.875rem] font-[600] text-[#101828]">
            Request Withdrawal ({currency})
          </span>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full hover:bg-[#E4E7EC] flex items-center justify-center transition-colors"
          >
            <Icon icon="hugeicons:cancel-01" className="w-4 h-4 text-[#667085]" />
          </button>
        </div>
        <p className="text-[.8125rem] text-[#667085]">
          No bank accounts added for {currency}. Add one in payout account settings first.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-3 p-4 rounded-[.75rem] border border-[#D0D5DD] bg-[#F9FAFB]">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[.875rem] font-[600] text-[#101828]">
          Request Withdrawal ({currency})
        </span>
        <button
          type="button"
          onClick={onClose}
          className="w-7 h-7 rounded-full hover:bg-[#E4E7EC] flex items-center justify-center transition-colors"
        >
          <Icon icon="hugeicons:cancel-01" className="w-4 h-4 text-[#667085]" />
        </button>
      </div>

      <form
        onSubmit={handleSubmit((data) => onSubmit(data.amount, selectedAccountId))}
        className="space-y-3"
      >
        <InputField
          type="select"
          label="Payout Account"
          name="payoutAccountId"
          placeholder="Select account"
          selectOptions={accountOptions}
          value={selectedAccountId}
          onChange={(e: { target: { name?: string; value: string } }) => setSelectedAccountId(e.target.value)}
        />

        <InputField
          type="number"
          label={`Amount (max ${fmt(available, currency)})`}
          placeholder="0.00"
          error={errors.amount?.message}
          {...register("amount", { valueAsNumber: true })}
        />

        <Button
          type="submit"
          loading={isWithdrawing}
          disabled={isWithdrawing || !isValid || !selectedAccountId}
          className="w-full justify-center"
        >
          Submit Request
        </Button>
      </form>
    </div>
  );
}

// ─── Main WithdrawModal ───────────────────────────────────────────────────────

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Settings path differs between affiliate and student portals */
  settingsPath: string;
}

export function WithdrawModal({ isOpen, onClose, settingsPath }: WithdrawModalProps) {
  const { accessToken } = useAuthStore();
  const {
    currencyBalances,
    isLoadingBalances,
    fetchBalances,
    payoutAccounts,
    isLoadingPayoutAccounts,
    fetchPayoutAccounts,
    isWithdrawing,
    requestWithdrawal,
  } = useAffiliateStore();

  const [withdrawCurrency, setWithdrawCurrency] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !accessToken) return;
    fetchBalances();
    fetchPayoutAccounts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, accessToken]);

  // Reset inline form when modal closes
  useEffect(() => {
    if (!isOpen) setWithdrawCurrency(null);
  }, [isOpen]);

  function handleWithdraw(amount: number, payoutAccountId: string) {
    if (!withdrawCurrency) return;
    requestWithdrawal(amount, withdrawCurrency, payoutAccountId, () => {
      setWithdrawCurrency(null);
      onClose();
    });
  }

  const isLoading = isLoadingBalances || isLoadingPayoutAccounts;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="rounded-[1rem] w-full max-w-lg"
      overflowY="hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 sm:p-5 border-b border-[#F2F4F7] shrink-0">
        <div>
          <h2 className="text-[.9375rem] sm:text-[1.0625rem] font-[600] text-[#101828]">Withdraw Earnings</h2>
          <p className="text-[.75rem] sm:text-[.8125rem] text-[#667085] mt-[.125rem]">
            Select a currency balance to withdraw from.
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="w-8 h-8 rounded-full hover:bg-[#F2F4F7] flex items-center justify-center transition-colors shrink-0"
        >
          <Icon icon="hugeicons:cancel-01" className="w-5 h-5 text-[#667085]" />
        </button>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-5 overflow-y-auto flex-1">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Icon icon="svg-spinners:ring-resize" className="w-8 h-8 text-[#007FFF]" />
          </div>
        ) : currencyBalances.length === 0 ? (
          <div className="text-center py-10">
            <Icon icon="hugeicons:money-bag-02" className="w-10 h-10 text-[#D0D5DD] mx-auto mb-3" />
            <p className="text-[.875rem] text-[#667085]">No earnings available for withdrawal yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {currencyBalances.map((bal) => (
              <div key={bal.currency}>
                <div
                  style={{ boxShadow: CARD_SHADOW }}
                  className="rounded-[.75rem] bg-white p-4 flex items-center justify-between gap-4"
                >
                  <div>
                    <p className="text-[.75rem] sm:text-[.8125rem] font-[500] text-[#667085]">{bal.currency}</p>
                    <p className="text-[1.125rem] sm:text-[1.375rem] font-[700] text-[#101828] leading-tight">
                      {fmt(bal.available, bal.currency)}
                    </p>
                    <p className="text-[.6875rem] sm:text-[.75rem] text-[#98A2B3]">
                      Total earned: {fmt(bal.totalEarned, bal.currency)}
                    </p>
                  </div>
                  <Button
                    onClick={() =>
                      setWithdrawCurrency(
                        withdrawCurrency === bal.currency ? null : bal.currency,
                      )
                    }
                    disabled={bal.available <= 0}
                    variant={withdrawCurrency === bal.currency ? "outlined" : "contained"}
                    className="shrink-0"
                  >
                    {withdrawCurrency === bal.currency ? "Cancel" : "Withdraw"}
                  </Button>
                </div>

                {withdrawCurrency === bal.currency && (
                  <WithdrawForm
                    currency={bal.currency}
                    available={bal.available}
                    accounts={payoutAccounts}
                    onClose={() => setWithdrawCurrency(null)}
                    onSubmit={handleWithdraw}
                    isWithdrawing={isWithdrawing}
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="shrink-0 p-3 sm:p-4 border-t border-[#F2F4F7] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1.5 sm:gap-3">
        <span className="text-[.75rem] sm:text-[.8125rem] text-[#667085]">
          Need to add or manage your bank accounts?
        </span>
        <Link
          href={settingsPath}
          onClick={onClose}
          className="text-[.75rem] sm:text-[.8125rem] font-[600] text-[#007FFF] hover:underline flex items-center gap-1 shrink-0"
        >
          Payout accounts
          <Icon icon="hugeicons:arrow-right-02" className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </Link>
      </div>
    </Modal>
  );
}
