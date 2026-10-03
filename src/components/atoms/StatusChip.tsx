import { CommissionStatus, PayoutStatus, SubscriptionStatus } from "@/types";

const StatusChip = ({
  id = CommissionStatus.PAID,
  type = "commission",
}: {
  id: string;
  type?: "commission" | "payout" | "subscription" | "acc_stat";
}) => {
  const config =
    type === "commission"
      ? [
          {
            id: CommissionStatus.PAID,
            color: "#067647",
            bgColor: "#ECFDF3",
            label: "Paid",
            borderColor: "#ABEFC6",
          },
          {
            id: CommissionStatus.CONFIRMED,
            color: "#B54708",
            bgColor: "#FEF6E7",
            label: "Confirmed",
            borderColor: "#FEDF89",
          },
        ]
      : type === "payout"
        ? [
            {
              id: PayoutStatus.PENDING,
              color: "#344054",
              bgColor: "#F9FAFB",
              label: "Pending",
              borderColor: "#EAECF0",
            },
            {
              id: PayoutStatus.PROCESSING,
              color: "#026AA2",
              bgColor: "#F0F9FF",
              label: "Processing",
              borderColor: "#B9E6FE",
            },
            {
              id: PayoutStatus.COMPLETED,
              color: "#067647",
              bgColor: "#ECFDF3",
              label: "Completed",
              borderColor: "#ABEFC6",
            },
            {
              id: PayoutStatus.FAILED,
              color: "#B42318",
              bgColor: "#FEF3F2",
              label: "Failed",
              borderColor: "#FECDCA",
            },
          ]
        : type === "subscription"
          ? [
              {
                id: SubscriptionStatus.PENDING,
                color: "#B54708",
                bgColor: "#FEF6E7",
                label: "Pending",
                borderColor: "#FEDF89",
              },
              {
                id: SubscriptionStatus.ACTIVE,
                color: "#067647",
                bgColor: "#ECFDF3",
                label: "Active",
                borderColor: "#ABEFC6",
              },
              {
                id: SubscriptionStatus.EXPIRED,
                color: "#B42318",
                bgColor: "#FEF3F2",
                label: "Expired",
                borderColor: "#FECDCA",
              },
              {
                id: SubscriptionStatus.CANCELLED,
                color: "#344054",
                bgColor: "#F2F4F7",
                label: "Cancelled",
                borderColor: "#D0D5DD",
              },
              {
                id: SubscriptionStatus.PAST_DUE,
                color: "#B54708",
                bgColor: "#FFFAEB",
                label: "Past due",
                borderColor: "#FECD7C",
              },
              {
                id: SubscriptionStatus.SUSPENDED,
                color: "#5925DC",
                bgColor: "#F4F3FF",
                label: "Suspended",
                borderColor: "#D9D6FE",
              },
            ]
          : type === "acc_stat"
            ? [
                {
                  id: true as unknown as string,
                  color: "#067647",
                  bgColor: "#ECFDF3",
                  label: "Active",
                  borderColor: "#ABEFC6",
                },
                {
                  id: false as unknown as string,
                  color: "#344054",
                  bgColor: "#F2F4F7",
                  label: "Inactive",
                  borderColor: "#D0D5DD",
                },
              ]
            : [];

  const currentChipInfo = config.find((iConfig) => iConfig.id === id);

  return (
    <div
      style={{
        border: `1px solid ${currentChipInfo?.borderColor}`,
        backgroundColor: currentChipInfo?.bgColor,
      }}
      className="flex w-fit items-center gap-[.25rem] rounded-[1rem] p-[2px_6px]"
    >
      <span
        style={{ borderRadius: "50%", backgroundColor: currentChipInfo?.color }}
        className={`h-[.5rem] w-[.5rem]`}
      ></span>
      <span
        style={{ color: currentChipInfo?.color }}
        className={`text-[.75rem] font-[500]`}
      >
        {currentChipInfo?.label}
      </span>
    </div>
  );
};

export { StatusChip };
