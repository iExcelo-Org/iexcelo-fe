"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Icon } from "@iconify/react";
import { InputField } from "@/components/molecules";
import { Button, CheckBox } from "@/components/atoms";
import { CARD_SHADOW, CURRENCY_SYMBOLS } from "@/utils";
import { useAffiliateStore, useAuthStore } from "@/store";
import { IPayoutAccount } from "@/types";

const CURRENCIES = ["NGN", "USD", "GBP", "EUR", "CAD", "AUD", "GHS", "GMD"];

const CURRENCY_OPTIONS = CURRENCIES.map((c) => ({
  value: c,
  label: `${c}${CURRENCY_SYMBOLS[c] ? ` (${CURRENCY_SYMBOLS[c]})` : ""}`,
}));

function formatAmount(amount: number, currency: string) {
  const symbol = CURRENCY_SYMBOLS[currency] ?? currency + " ";
  return `${symbol}${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// ─── Skeletons ───────────────────────────────────────────────────────────────

function BalanceSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
      {[1, 2].map((i) => (
        <div key={i} style={{ boxShadow: CARD_SHADOW }} className="rounded-[.75rem] bg-white p-5 animate-pulse">
          <div className="h-4 w-16 bg-[#F2F4F7] rounded mb-3" />
          <div className="h-7 w-28 bg-[#F2F4F7] rounded mb-4" />
          <div className="h-8 w-full bg-[#F2F4F7] rounded" />
        </div>
      ))}
    </div>
  );
}

// ─── Account Card ────────────────────────────────────────────────────────────

function AccountCard({
  account,
  onSetDefault,
  onRemove,
  isManaging,
}: {
  account: IPayoutAccount;
  onSetDefault: (id: string) => void;
  onRemove: (id: string) => void;
  isManaging: boolean;
}) {
  return (
    <div style={{ boxShadow: CARD_SHADOW }} className="rounded-[.75rem] bg-white p-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-full bg-[#EFF8FF] flex items-center justify-center shrink-0">
            <Icon icon="hugeicons:bank" className="w-5 h-5 text-[#007FFF]" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[.9375rem] font-[600] text-[#101828]">{account.bankName}</span>
              {account.isDefault && (
                <span className="text-[.6875rem] font-[600] px-2 py-[.125rem] rounded-full bg-[#ECFDF3] text-[#027A48]">
                  Default
                </span>
              )}
              <span className="text-[.75rem] font-[600] px-2 py-[.125rem] rounded-full bg-[#EFF8FF] text-[#007FFF]">
                {account.currency}
              </span>
            </div>
            <p className="text-[.8125rem] text-[#667085] mt-[.125rem] truncate">{account.accountName}</p>
            <p className="text-[.8125rem] text-[#667085]">{account.accountNumber}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:shrink-0">
          {!account.isDefault && (
            <Button variant="outlined" disabled={isManaging} onClick={() => onSetDefault(account.id)} className="flex-1 sm:flex-none">
              Set Default
            </Button>
          )}
          <Button
            variant="outlined"
            disabled={isManaging}
            onClick={() => onRemove(account.id)}
            className={`!border-[#FECDCA] !text-[#D42620] hover:!bg-[#FFF4F4] ${!account.isDefault ? "" : "flex-1 sm:flex-none"}`}
          >
            Remove
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Add Account Form ────────────────────────────────────────────────────────

const addAccountSchema = yup.object({
  currency: yup.string().required("Currency is required"),
  bankName: yup.string().required("Bank name is required"),
  accountNumber: yup.string().required("Account number is required"),
  accountName: yup.string().required("Account name is required"),
  bankCode: yup.string().optional().default(""),
});

type AddAccountFields = yup.InferType<typeof addAccountSchema>;

function AddAccountForm({
  onClose,
  onSubmit,
  isManaging,
}: {
  onClose: () => void;
  onSubmit: (data: AddAccountFields & { setAsDefault: boolean }) => void;
  isManaging: boolean;
}) {
  const [setAsDefault, setSetAsDefault] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
  } = useForm<AddAccountFields>({
    resolver: yupResolver(addAccountSchema) as any,
    mode: "onChange",
    defaultValues: { currency: "NGN", bankCode: "" },
  });

  return (
    <div style={{ boxShadow: CARD_SHADOW }} className="rounded-[.75rem] bg-white p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[.9375rem] font-[600] text-[#101828]">Add Bank Account</h3>
        <button
          type="button"
          onClick={onClose}
          className="w-7 h-7 rounded-full hover:bg-[#F2F4F7] flex items-center justify-center transition-colors"
        >
          <Icon icon="hugeicons:cancel-01" className="w-4 h-4 text-[#667085]" />
        </button>
      </div>

      <form
        onSubmit={handleSubmit((data) => onSubmit({ ...data, setAsDefault }))}
        className="space-y-4"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputField
            type="select"
            label="Currency"
            name="currency"
            placeholder="Select currency"
            selectOptions={CURRENCY_OPTIONS}
            value={watch("currency")}
            onChange={(e: { target: { name?: string; value: string } }) =>
              setValue("currency", e.target.value, { shouldValidate: true })
            }
            error={errors.currency?.message}
          />

          <InputField
            label="Bank Name"
            placeholder="e.g. Zenith Bank"
            error={errors.bankName?.message}
            {...register("bankName")}
          />

          <InputField
            label="Account Number"
            placeholder="0123456789"
            error={errors.accountNumber?.message}
            {...register("accountNumber")}
          />

          <InputField
            label="Account Name"
            placeholder="Full name on account"
            error={errors.accountName?.message}
            {...register("accountName")}
          />

          <InputField
            label="Bank Code (optional)"
            placeholder="e.g. 057"
            {...register("bankCode")}
          />
        </div>

        <CheckBox
          value={setAsDefault}
          onChange={(v) => setSetAsDefault(v)}
          label="Set as default payout account"
        />

        <div className="flex items-center gap-3 pt-1">
          <Button type="submit" loading={isManaging} disabled={!isValid || isManaging}>
            Save Account
          </Button>
          <Button type="button" variant="outlined" onClick={onClose} disabled={isManaging}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}

// ─── Withdrawal Form ─────────────────────────────────────────────────────────

function WithdrawalForm({
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

  const withdrawSchema = useMemo(
    () =>
      yup.object({
        amount: yup
          .number()
          .typeError("Enter a valid amount")
          .required("Amount is required")
          .positive("Amount must be greater than 0")
          .max(available, `Cannot exceed ${formatAmount(available, currency)}`),
      }),
    [available, currency],
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<{ amount: number }>({
    resolver: yupResolver(withdrawSchema) as any,
    mode: "onChange",
  });

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

      {currencyAccounts.length === 0 ? (
        <p className="text-[.8125rem] text-[#667085]">
          No bank accounts added for {currency}. Add one below first.
        </p>
      ) : (
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
            label={`Amount (max ${formatAmount(available, currency)})`}
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
      )}
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function PayoutAccounts() {
  const { accessToken } = useAuthStore();
  const {
    currencyBalances,
    isLoadingBalances,
    fetchBalances,
    payoutAccounts,
    isLoadingPayoutAccounts,
    isManagingPayoutAccount,
    fetchPayoutAccounts,
    addPayoutAccount,
    removePayoutAccount,
    setDefaultPayoutAccount,
    isWithdrawing,
    requestWithdrawal,
  } = useAffiliateStore();

  const [showAddForm, setShowAddForm] = useState(false);
  const [withdrawCurrency, setWithdrawCurrency] = useState<string | null>(null);

  useEffect(() => {
    if (!accessToken) return;
    fetchPayoutAccounts();
    fetchBalances();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);

  function handleAddAccount(form: AddAccountFields & { setAsDefault: boolean }) {
    addPayoutAccount(
      {
        currency: form.currency,
        bankName: form.bankName,
        accountNumber: form.accountNumber,
        accountName: form.accountName,
        bankCode: form.bankCode || undefined,
        setAsDefault: form.setAsDefault,
      },
      () => setShowAddForm(false),
    );
  }

  function handleWithdraw(amount: number, payoutAccountId: string) {
    if (!withdrawCurrency) return;
    requestWithdrawal(amount, withdrawCurrency, payoutAccountId, () =>
      setWithdrawCurrency(null),
    );
  }

  return (
    <div className="space-y-8">
      {/* ── Available Balances ────────────────────────────────────── */}
      <div>
        <h2 className="text-[1.125rem] font-[600] text-[#101828] mb-1">Available Balances</h2>
        <p className="text-[.875rem] text-[#667085] mb-4">
          Earnings ready for withdrawal, per currency.
        </p>

        {isLoadingBalances ? (
          <BalanceSkeleton />
        ) : currencyBalances.length === 0 ? (
          <div style={{ boxShadow: CARD_SHADOW }} className="rounded-[.75rem] bg-white p-6 text-center">
            <Icon icon="hugeicons:money-bag-02" className="w-10 h-10 text-[#D0D5DD] mx-auto mb-3" />
            <p className="text-[.875rem] text-[#667085]">
              No earnings yet. Share your affiliate link to start earning.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {currencyBalances.map((bal) => (
              <div key={bal.currency}>
                <div style={{ boxShadow: CARD_SHADOW }} className="rounded-[.75rem] bg-white p-5">
                  <p className="text-[.8125rem] font-[500] text-[#667085] mb-1">{bal.currency}</p>
                  <p className="text-[1.5rem] font-[700] text-[#101828] leading-tight mb-[.25rem]">
                    {formatAmount(bal.available, bal.currency)}
                  </p>
                  <p className="text-[.75rem] text-[#98A2B3] mb-4">
                    Total earned: {formatAmount(bal.totalEarned, bal.currency)}
                  </p>
                  <Button
                    onClick={() =>
                      setWithdrawCurrency(
                        withdrawCurrency === bal.currency ? null : bal.currency,
                      )
                    }
                    disabled={bal.available <= 0}
                    variant={withdrawCurrency === bal.currency ? "outlined" : "contained"}
                    className="w-full justify-center"
                  >
                    {withdrawCurrency === bal.currency ? "Cancel" : "Withdraw"}
                  </Button>
                </div>

                {withdrawCurrency === bal.currency && (
                  <WithdrawalForm
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

      {/* ── Bank Accounts ─────────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <div>
            <h2 className="text-[1.125rem] font-[600] text-[#101828]">Bank Accounts</h2>
            <p className="text-[.875rem] text-[#667085] mt-[.125rem] mb-4">
              Accounts where withdrawals will be sent.
            </p>
          </div>
          {!showAddForm && (
            <Button onClick={() => setShowAddForm(true)} className="shrink-0">
              <Icon icon="hugeicons:add-01" className="w-4 h-4" />
              Add Account
            </Button>
          )}
        </div>

        {isLoadingPayoutAccounts ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div
                key={i}
                style={{ boxShadow: CARD_SHADOW }}
                className="rounded-[.75rem] bg-white p-5 animate-pulse"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#F2F4F7]" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-32 bg-[#F2F4F7] rounded" />
                    <div className="h-3 w-24 bg-[#F2F4F7] rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {payoutAccounts.map((account) => (
              <AccountCard
                key={account.id}
                account={account}
                onSetDefault={setDefaultPayoutAccount}
                onRemove={removePayoutAccount}
                isManaging={isManagingPayoutAccount}
              />
            ))}

            {payoutAccounts.length === 0 && !showAddForm && (
              <div
                style={{ boxShadow: CARD_SHADOW }}
                className="rounded-[.75rem] bg-white p-6 text-center"
              >
                <Icon icon="hugeicons:bank" className="w-10 h-10 text-[#D0D5DD] mx-auto mb-3" />
                <p className="text-[.875rem] text-[#667085] mb-1">No bank accounts added yet.</p>
                <p className="text-[.8125rem] text-[#98A2B3]">
                  Add a bank account to request withdrawals.
                </p>
              </div>
            )}

            {showAddForm && (
              <AddAccountForm
                onClose={() => setShowAddForm(false)}
                onSubmit={handleAddAccount}
                isManaging={isManagingPayoutAccount}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
