/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import React, {
  memo,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { TableVirtuoso } from "react-virtuoso";
import { SVGClient, CheckBox } from "../atoms";
import { debounce } from "@/utils";
import { geistSans } from "@/lib/fonts";
import { Icon } from "@iconify/react";

type thOptions = {
  title: string;
  isHead?: boolean;
  customTableHead?: (value: any) => ReactNode;
  customTableBody?: (value: any) => ReactNode;
  minWidth?: number;
  width?: number;
  maxWidth?: number;
};

type metaDataOPtions = {
  endPage?: number;
  currentPage?: number;
  totalRecords?: number;
  onPageChange?: (skip: number) => void;
};

type searchOptions = {
  show?: boolean;
  placeholder?: string;
  onResolve?: (data: string | number) => void;
};

type filterOptions = {
  show?: boolean;
  avoid?: number[];
  mask?: Record<number, { value: any; mask: any }[]>;
};

type IDataTableProps = {
  columns: Array<string | thOptions>;
  data: Array<Array<any>>;
  pagination?: boolean;
  head?: boolean;
  metaData?: metaDataOPtions;
  search?: searchOptions;
  filter?: filterOptions;
  recordsPerPage?: number;
  isCheckable?: boolean;
  numberColName?: string;
  customEmptyState?: ReactNode;
  loading?: boolean;
  emptyStateProps?: {
    svg: string;
    title: string;
    text: string;
    cta?: { text: string; action: () => void };
  };
  shouldNotHaveBorder?: boolean;
  nonScrollable?: boolean;
  onCheckChange?: (e: any) => void;
};

const DataTable = ({
  columns,
  numberColName,
  onCheckChange = () => null,
  shouldNotHaveBorder = false,
  ...props
}: IDataTableProps) => {
  const [isBottom, setIsBottom] = useState<boolean>(false);
  const container = useRef<HTMLDivElement | null>(null);
  const [selectedCheckBoxes, setSelectedCheckedBoxes] = useState<Array<number>>([]);
  const [filter, setFilter] = useState<{
    popover: boolean;
    selectedOptions: Record<number, { name: string; isOpen: boolean }>;
    filters: Record<number, (number | string)[]>;
  }>({
    popover: false,
    selectedOptions: {},
    filters: {},
  });

  const popoverRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const triggerRefs = useRef<Map<number, HTMLButtonElement>>(new Map());

  const handleSearch = useCallback(
    debounce((value: string) => {
      props?.search?.onResolve?.(value);
    }, 500),
    [],
  );

  const filterColumns = (data: any[][]) => {
    return data?.map((row) => {
      return row?.filter((_, columnIndex) => {
        const filterValues = filter.filters[columnIndex];
        if (!filterValues || !filterValues.length) return true;
        const columnValue = row[columnIndex];
        return filterValues.includes(columnValue);
      });
    });
  };

  const handleScroll = () => {
    if (container.current) {
      const { scrollTop, scrollHeight, clientHeight } = container.current;
      setIsBottom(scrollTop + clientHeight >= scrollHeight);
    }
  };

  const handleClickOutside = (event: MouseEvent) => {
    popoverRefs.current.forEach((popoverRef, index) => {
      const triggerRef = triggerRefs.current.get(index);
      if (
        popoverRef &&
        !popoverRef.contains(event.target as Node) &&
        triggerRef &&
        !triggerRef.contains(event.target as Node)
      ) {
        if (index === 1001)
          setFilter((prev) => ({ ...prev, popover: false }));
        else
          setFilter((prev) => ({
            ...prev,
            selectedOptions: {
              ...prev.selectedOptions,
              [index]: { ...prev.selectedOptions[+index], isOpen: false },
            },
          }));
      }
    });
  };

  useEffect(() => {
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const formattedData = filterColumns(props?.data) || [];

  useEffect(() => {
    handleScroll();
    const parent = container.current;
    if (parent) {
      parent.addEventListener("scroll", handleScroll);
      return () => parent.removeEventListener("scroll", handleScroll);
    }
  }, [JSON.stringify(formattedData)]);

  useEffect(() => {
    setFilter({ popover: false, selectedOptions: {}, filters: {} });
  }, [JSON.stringify(columns)]);

  useEffect(() => {
    const selectedData = formattedData.filter((_, index) =>
      selectedCheckBoxes.includes(index),
    );
    onCheckChange(selectedData);
  }, [JSON.stringify(selectedCheckBoxes)]);

  // Columns with isHead:true → appear in card header
  const headColsWithIndex = useMemo(
    () =>
      columns
        .map((col, idx) => ({ col, idx }))
        .filter(({ col }) => typeof col !== "string" && (col as thOptions).isHead === true),
    [columns],
  );

  // All other columns → appear in card body as label:value rows
  const bodyColsWithIndex = useMemo(
    () =>
      columns
        .map((col, idx) => ({ col, idx }))
        .filter(({ col }) => !(typeof col !== "string" && (col as thOptions).isHead === true)),
    [columns],
  );

  // ─── Desktop table sub-components ────────────────────────────────────────────

  const Table = React.forwardRef((restProps: any, ref) => (
    <table
      style={{ borderCollapse: "collapse", overflow: "auto", height: "100%" }}
      ref={ref}
      {...restProps}
    >
      <thead className="sticky top-0 z-1 h-fit bg-white">
        <tr className="h-[46px] min-h-[46px] overflow-hidden">
          {props?.isCheckable ? (
            <th align="left" className="px-6 py-2 text-xs font-bold leading-[120%] text-[#344054]">
              <CheckBox
                value={selectedCheckBoxes.length === formattedData.length && formattedData.length > 0}
                onChange={(checked) => {
                  if (checked) {
                    setSelectedCheckedBoxes(Array.from({ length: formattedData.length }, (_, i) => i));
                  } else {
                    setSelectedCheckedBoxes([]);
                  }
                }}
              />
            </th>
          ) : (
            <th className={`${geistSans.className} px-6 py-2 text-left text-xs font-medium leading-4 text-[#475467]`}>
              {numberColName ?? "S/N"}
            </th>
          )}
          {columns?.map((e, index) => {
            if (typeof e !== "string") {
              return (
                <th align="left" className="px-6 py-2 text-xs font-medium leading-4 text-[#475467]" key={`__head-${e.title + index}`}>
                  {e.customTableHead ? e.customTableHead(e.title) : e.title}
                </th>
              );
            }
            return (
              <th align="left" className="px-6 py-2 text-xs font-medium leading-4 text-[#475467]" key={`__head-${e + index}`}>
                {e}
              </th>
            );
          })}
        </tr>
      </thead>
      {restProps?.children}
    </table>
  ));
  Table.displayName = "Table";

  const TableRow = React.forwardRef((restProps: any, ref) => {
    const row_index = restProps["data-index"];
    return (
      <tr
        ref={ref}
        key={1}
        {...restProps}
        data-index={restProps["data-index"]}
        style={{
          backgroundColor: restProps["data-index"] % 2 ? "#FCFCFD" : "#fff",
          ...restProps?.style,
        }}
      >
        {props?.isCheckable ? (
          <td className={`h-24 px-6 py-2 text-sm font-normal leading-[120%] ${row_index === formattedData?.length - 1 && isBottom ? "last-row" : ""}`}>
            <CheckBox
              value={selectedCheckBoxes.includes(row_index)}
              onChange={(checked) => {
                if (!checked) setSelectedCheckedBoxes((prev) => prev.filter((i) => i !== row_index));
                else setSelectedCheckedBoxes((prev) => [...prev, row_index]);
              }}
            />
          </td>
        ) : (
          <td className={`${geistSans.className} h-24 px-6 py-2 text-sm font-medium leading-[18.9px] text-[#A7AEB1] ${row_index === formattedData.length - 1 && isBottom ? "last-row" : ""}`}>
            {row_index + 1}
          </td>
        )}
        {columns?.map((e, index) => {
          const data = restProps?.item[index];
          if (typeof e === "string") {
            return (
              <td className={`h-24 px-6 py-2 text-sm font-normal leading-[120%] ${row_index === formattedData.length - 1 && isBottom ? "last-row" : ""}`} key={"__table_column_data" + index + row_index}>
                {data}
              </td>
            );
          }
          const { customTableBody, minWidth, width, maxWidth }: thOptions = e;
          if (!!customTableBody) {
            return (
              <td className={`h-24 px-6 py-4 text-sm font-normal leading-[120%] ${row_index === formattedData.length - 1 && isBottom ? "last-row" : ""}`} style={{ minWidth, maxWidth, width }} key={"__table_column_data" + index + row_index}>
                {customTableBody!(data)}
              </td>
            );
          }
          return (
            <td className={`h-24 px-6 py-2 text-sm font-normal leading-[120%] ${row_index === formattedData.length - 1 && isBottom ? "last-row" : ""}`} key={"__table_column_data" + index + row_index}>
              {data}
            </td>
          );
        })}
      </tr>
    );
  });
  TableRow.displayName = "TableBody";

  const TableBody = React.forwardRef((restProps: any, ref) => (
    <tbody ref={ref} {...restProps}>
      {props.loading ? (
        <tr className="h-fit w-full bg-white">
          <td colSpan={columns.length + 1} className="last-row" height="620px">
            <div className="flex h-full w-full flex-col overflow-hidden">
              {Array.from({ length: 10 }, (_, index) => (
                <div key={`pulse__child__${index}`} className={`min-h-[6em] ${index % 2 === 0 ? "pulse bg-[#f5f5f9b8]" : "bg-[#fff]"}`} />
              ))}
            </div>
          </td>
        </tr>
      ) : !formattedData.length ? (
        <tr className="h-fit w-full bg-white">
          <td colSpan={columns.length + 1} className="last-row mx-auto" height="500px">
            {!!props?.customEmptyState ? (
              props.customEmptyState
            ) : (
              <div className="mx-auto flex h-full max-w-[30.1875rem] flex-col items-center justify-center bg-transparent">
                <Icon className="w-15 h-15" icon={props?.emptyStateProps?.svg || "hugeicons:shopping-cart-02"} />
                <h4 className="mb-3 text-center text-[1.75rem] font-medium leading-[2.125rem] text-black">{props?.emptyStateProps?.title || "No Data"}</h4>
                <p className="mb-6 text-center text-base font-normal leading-6">{props?.emptyStateProps?.text || "No data available"}</p>
              </div>
            )}
          </td>
        </tr>
      ) : (
        restProps?.children
      )}
    </tbody>
  ));
  TableBody.displayName = "TableBody";

  // ─── Shared filter popover content (used in head section) ────────────────────

  const FilterPopover = ({ filterId }: { filterId: string }) => (
    <div
      ref={(el) => {
        if (el) popoverRefs.current.set(+filterId, el);
        else popoverRefs.current.delete(+filterId);
      }}
      className="absolute left-0 top-full mt-1 z-10 min-w-[15rem] rounded-lg border bg-white px-2 py-3 shadow-sm"
    >
      <div className="flex flex-col items-start gap-1">
        {(() => {
          const filteredOptions = props?.data
            ?.map((innerArray) => innerArray[+filterId])
            ?.filter(
              (entry, i, arr) =>
                entry !== undefined &&
                !Array.isArray(entry) &&
                typeof entry !== "object" &&
                entry !== null &&
                arr.findIndex((el) => el === entry) === i,
            );

          if (!filteredOptions || filteredOptions.length === 0) {
            return <span className="w-full text-center text-sm text-[#6b7280]">No data</span>;
          }

          return filteredOptions.map((option, index) => (
            <button
              onClick={() =>
                setFilter((prev) => {
                  const currentFilter = prev.filters[+filterId] || [];
                  const isSelected = currentFilter.includes(option);
                  const updatedFilters = isSelected
                    ? { ...prev.filters, [+filterId]: currentFilter.filter((item) => item !== option) }
                    : { ...prev.filters, [+filterId]: [...currentFilter, option] };
                  return { ...prev, filters: updatedFilters };
                })
              }
              className="flex w-full items-center justify-between rounded bg-white px-2 py-[0.625rem] text-left text-sm text-[#101828] transition-all duration-[.4s] hover:bg-[#00000015]"
              key={`option__${option}__${index}`}
            >
              {!!props?.filter?.mask?.[+filterId]
                ? props?.filter?.mask?.[+filterId]?.find((m) => m.value == option)?.mask
                : option}
              {filter.filters[+filterId]?.includes(option) && (
                <SVGClient style={{ color: "#ff6642" }} src="/svg/check.svg" />
              )}
            </button>
          ));
        })()}
      </div>
    </div>
  );

  // ─── Render ───────────────────────────────────────────────────────────────────

  return (
    <section className={`flex h-full flex-1 flex-col overflow-hidden ${shouldNotHaveBorder ? "" : "rounded-2xl border border-[#E4E7EC]"}`}>

      {/* Head: search + filter (always visible, responsive) */}
      {props?.head && (
        <div className="relative mb-2 sm:mb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 sm:p-4">
          {props?.search?.show ? (
            <div className="relative h-fit w-full sm:w-fit">
              <input
                onChange={(e) => handleSearch(e.target.value)}
                placeholder={props?.search?.placeholder || "Searching for something?"}
                type="text"
                className="w-full sm:w-[20rem] rounded-lg border border-[#D0D5DD] py-[0.625rem] pl-[2.4rem] pr-[.875rem] text-sm font-normal leading-4 text-[#667085] outline-none shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)]"
              />
              <div className="absolute top-0 ml-[.875rem] flex h-full items-center justify-center">
                <SVGClient style={{ color: "#667085" }} src="/svg/search-lg.svg" />
              </div>
            </div>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2 flex-wrap">
            {props?.filter?.show && (
              <div className="flex items-center gap-2 flex-wrap">
                {Object.entries(filter.selectedOptions).map(([filterId, filterOption], index) => (
                  <div className="relative" key={`filter-option__${filterOption.name}__${index}`}>
                    <button
                      ref={(el) => {
                        if (el) triggerRefs.current.set(+filterId, el);
                        else triggerRefs.current.delete(+filterId);
                      }}
                      className="flex items-center gap-2 rounded-lg border border-[#D0D5DD] bg-white px-3 sm:px-4 py-[.5rem] sm:py-[0.625rem] text-xs sm:text-sm font-bold leading-[18.9px] text-[#344054]"
                      onClick={() =>
                        setFilter((prev) => ({
                          ...prev,
                          selectedOptions: {
                            ...prev.selectedOptions,
                            [filterId]: {
                              ...prev.selectedOptions[+filterId],
                              isOpen: !prev.selectedOptions[+filterId].isOpen,
                            },
                          },
                        }))
                      }
                    >
                      <SVGClient
                        style={{ color: "#667185", transition: "all .4s", transform: filterOption.isOpen ? "rotate(180deg)" : "" }}
                        src="/svg/chevron-down.svg"
                      />
                      {filterOption.name}
                    </button>
                    {filterOption.isOpen && (
                      <FilterPopover filterId={filterId} />
                    )}
                  </div>
                ))}
                {(!!Object.values(filter.selectedOptions).length || !!Object.values(filter.filters).length) && (
                  <button
                    onClick={() => setFilter((prev) => ({ ...prev, filters: {}, selectedOptions: {} }))}
                    className="rounded-lg border border-[#D0D5DD] p-1 sm:p-1.5"
                  >
                    <SVGClient style={{ color: "#667185" }} src="/svg/x-close-2.svg" />
                  </button>
                )}
                <button
                  ref={(el) => {
                    if (el) triggerRefs.current.set(1001, el);
                    else triggerRefs.current.delete(1001);
                  }}
                  className="flex items-center gap-1.5 sm:gap-2 border-none px-3 sm:px-4 py-[.5rem] sm:py-[0.625rem] text-xs sm:text-sm font-bold leading-[18.9px] text-[#344054] transition-all duration-[.4s] hover:bg-[#FFF2E790] hover:text-[#FF664290]"
                  onClick={() => setFilter((prev) => ({ ...prev, popover: !prev.popover }))}
                >
                  <SVGClient style={{ color: "inherit" }} src="/svg/filter-lines.svg" />
                  <span className="hidden sm:inline">Filter</span>
                </button>
              </div>
            )}
          </div>

          {props?.filter?.show && filter.popover && (
            <div
              ref={(el) => {
                if (el) popoverRefs.current.set(1001, el);
                else popoverRefs.current.delete(1001);
              }}
              className="absolute right-3 sm:right-4 top-full mt-1 z-10 min-w-[15rem] rounded-lg border bg-white px-2 py-3 shadow-sm"
            >
              <h4 className="border-b text-xs text-[#101828]">Filter By</h4>
              <div className="mt-2 flex flex-col items-start gap-1">
                {columns?.map((e, index) => {
                  if (props?.filter?.avoid?.includes(index)) return null;
                  const option = typeof e !== "string" ? e?.title : e;
                  return (
                    <button
                      onClick={() =>
                        setFilter((prev) => {
                          const isSelected = !!prev.selectedOptions[index];
                          const updatedOptions = isSelected
                            ? Object.fromEntries(Object.entries(prev.selectedOptions).filter(([key]) => +key !== index))
                            : { ...prev.selectedOptions, [index]: { name: option, isOpen: false } };
                          const updatedFilters = isSelected
                            ? Object.fromEntries(Object.entries(prev.filters).filter(([key]) => +key !== index))
                            : prev.filters;
                          return { ...prev, selectedOptions: updatedOptions, filters: updatedFilters };
                        })
                      }
                      className="flex w-full items-center justify-between rounded bg-white px-2 py-[0.625rem] text-left text-sm text-[#101828] transition-all duration-[.4s] hover:bg-[#00000015]"
                      key={`option__${option}__${index}`}
                    >
                      {option}
                      {filter.selectedOptions[index] && <SVGClient style={{ color: "#ff6642" }} src="/svg/check.svg" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Desktop table (lg+) ─────────────────────────────────────────────────── */}
      <div
        ref={container}
        className={`hidden lg:block relative max-h-full overflow-auto ${shouldNotHaveBorder ? "" : "rounded-lg"}`}
        style={{ "--tw-border-opacity": 1 } as any}
      >
        <style jsx>{`
          div :global(table) { width: 100%; height: fit-content; }
          div :global(th:after) { bottom: -1px; width: 100%; left: 0; position: absolute; content: ""; border-bottom: 1px solid #f1f1f1 !important; }
          div :global(.last-row) { border-bottom: none !important; }
          div :global(thead) { background-color: #fff; position: sticky; z-index: 1; top: 0; height: fit-content; }
        `}</style>
        <TableVirtuoso
          data={props?.data}
          style={{
            height: props?.loading
              ? "700px"
              : props?.data.length
                ? props?.nonScrollable
                  ? `${(99 * props?.data.length + 45) / 16}rem`
                  : `${(99 * (props?.data.length > 10 ? 10 : props?.data.length) + 47) / 16}rem`
                : "550px",
            width: "100%",
          }}
          components={{
            Table: Table as any,
            TableBody: TableBody as any,
            TableRow: TableRow as any,
          }}
          increaseViewportBy={{ bottom: 500, top: 500 }}
          fixedItemHeight={67}
          itemContent={(row_index: number, row_data: any) => (
            <>
              {props?.isCheckable ? (
                <td className={`h-24 px-6 py-4 text-sm font-normal leading-[120%] ${row_index === props?.data.length - 1 && isBottom ? "last-row" : ""}`}>
                  <CheckBox
                    value={selectedCheckBoxes.includes(row_index)}
                    onChange={(checked) => {
                      if (!checked) setSelectedCheckedBoxes((prev) => prev.filter((i) => i !== row_index));
                      else setSelectedCheckedBoxes((prev) => [...prev, row_index]);
                    }}
                  />
                </td>
              ) : (
                <td className={`h-24 px-6 py-4 text-sm font-normal leading-[120%] ${row_index === props?.data.length - 1 && isBottom ? "last-row" : ""}`}>
                  {row_index + 1}
                </td>
              )}
              {columns?.map((e, index) => {
                const data = row_data[index];
                if (typeof e === "string") {
                  return (
                    <td className={`h-24 px-6 py-4 text-sm font-normal leading-[120%] ${row_index === props?.data.length - 1 && isBottom ? "last-row" : ""}`} key={"__table_column_data" + index + row_index}>
                      {data}
                    </td>
                  );
                }
                const { customTableBody, minWidth, width, maxWidth }: thOptions = e;
                if (!!customTableBody) {
                  return (
                    <td className={`h-24 px-6 py-4 text-sm font-normal leading-[120%] ${row_index === props?.data.length - 1 && isBottom ? "last-row" : ""}`} style={{ minWidth, maxWidth, width }} key={"__table_column_data" + index + row_index}>
                      {customTableBody!(data)}
                    </td>
                  );
                }
                return (
                  <td className={`h-24 px-6 py-4 text-sm font-normal leading-[120%] ${row_index === props?.data.length - 1 && isBottom ? "last-row" : ""}`} key={"__table_column_data" + index + row_index}>
                    {data}
                  </td>
                );
              })}
            </>
          )}
        />
        {props?.pagination && (
          <section className="sticky transition-all duration-200" style={{ bottom: isBottom ? "0px" : "12px" }}>
            <div className={`m-auto flex min-w-fit flex-row items-center justify-between border border-[#EAECF0] px-4 py-3 transition-all duration-200 ${isBottom ? "w-full rounded-b-lg border-b-0 border-l-0 border-r-0 border-t bg-white" : "w-0 rounded-lg bg-[#FFFFFFEE]"}`}>
              {props?.loading ? (
                <div className="pulse h-[15px] w-[200px] rounded-[10px] bg-[#f5f5f9]" />
              ) : (
                <div className={`overflow-hidden text-sm font-semibold leading-[142.857%] text-[#202224] opacity-60 transition-all duration-200 ${isBottom ? "block" : "hidden"}`}>
                  Showing {props?.metaData?.currentPage || 1}-{props?.metaData?.endPage || 1} of {props?.metaData?.totalRecords || 1}
                </div>
              )}
              <div className="flex items-center gap-[1.375rem]">
                <button
                  onClick={() => props?.metaData?.onPageChange?.(Math.max(0, (props?.metaData?.currentPage || 0) - 50 - 1) || 0)}
                  disabled={props?.loading || props?.metaData?.currentPage === 1}
                  className="min-h-0 min-w-0 rounded-lg border border-[#D0D5DD] p-2 shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] disabled:cursor-not-allowed"
                >
                  <Icon style={{ color: props?.loading || props?.metaData?.currentPage === 1 ? "#34405490" : "#344054" }} icon="hugeicons:arrow-left-01" className="w-5 h-5" />
                </button>
                <button
                  onClick={() => props?.metaData?.onPageChange?.(props?.metaData?.endPage || 1)}
                  disabled={props.loading || props?.metaData?.endPage === props?.metaData?.currentPage}
                  className="disabled:cursor-not-allowed"
                  style={{ padding: ".5rem", minHeight: 0, minWidth: 0, border: "1px solid #D0D5DD", boxShadow: "0px 1px 2px 0px rgba(16, 24, 40, 0.05)", borderRadius: ".5rem" }}
                >
                  <Icon icon="hugeicons:arrow-right-01" style={{ color: props.loading || props?.metaData?.endPage === props?.metaData?.currentPage ? "#34405490" : "#344054" }} className="w-5 h-5" />
                </button>
              </div>
            </div>
          </section>
        )}
      </div>

      {/* ── Mobile / tablet card grid (below lg) ────────────────────────────────── */}
      <div className="lg:hidden flex-1 overflow-auto px-3 sm:px-4 pt-3 sm:pt-4 pb-4">

        {props.loading ? (
          /* Loading skeleton */
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i} className="rounded-[.75rem] border border-[#E4E7EC] bg-white overflow-hidden animate-pulse">
                <div className="h-10 sm:h-11 bg-gray-100 border-b border-[#E4E7EC]" />
                {Array.from({ length: 5 }, (_, j) => (
                  <div key={j} className="flex justify-between items-center px-3 py-2.5 border-b last:border-0 border-[#E4E7EC] gap-3">
                    <div className="h-3 w-14 sm:w-16 bg-gray-200 rounded shrink-0" />
                    <div className="h-3 w-20 sm:w-24 bg-gray-100 rounded" />
                  </div>
                ))}
              </div>
            ))}
          </div>
        ) : !formattedData.length ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            {!!props?.customEmptyState ? (
              props.customEmptyState
            ) : (
              <>
                <Icon className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mb-3" icon={props?.emptyStateProps?.svg || "hugeicons:shopping-cart-02"} />
                <h4 className="mb-2 text-[1.125rem] sm:text-[1.375rem] font-medium text-black">{props?.emptyStateProps?.title || "No Data"}</h4>
                <p className="text-[.8125rem] sm:text-sm text-gray-500">{props?.emptyStateProps?.text || "No data available"}</p>
              </>
            )}
          </div>
        ) : (
          /* Card grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {formattedData.map((row, row_index) => {
              // First N-1 isHead cols → left side of card header (identifier)
              // Last isHead col (if multiple) → right side of card header (actions)
              const primaryHeads = headColsWithIndex.length > 1
                ? headColsWithIndex.slice(0, -1)
                : headColsWithIndex;
              const actionsCol = headColsWithIndex.length > 1
                ? headColsWithIndex[headColsWithIndex.length - 1]
                : null;

              return (
                <div key={row_index} className="rounded-[.75rem] border border-[#E4E7EC] bg-white overflow-hidden">

                  {/* Card header */}
                  <div className="flex items-center justify-between gap-2 px-3 sm:px-4 py-2.5 sm:py-3 border-b border-[#E4E7EC] bg-[#F9FAFB]">
                    <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 overflow-hidden">
                      {props.isCheckable ? (
                        <CheckBox
                          value={selectedCheckBoxes.includes(row_index)}
                          onChange={(checked) => {
                            if (!checked) setSelectedCheckedBoxes((prev) => prev.filter((i) => i !== row_index));
                            else setSelectedCheckedBoxes((prev) => [...prev, row_index]);
                          }}
                        />
                      ) : (
                        <span className={`${geistSans.className} text-[.6875rem] sm:text-xs font-medium text-[#A7AEB1] shrink-0`}>
                          {row_index + 1}
                        </span>
                      )}
                      {primaryHeads.map(({ col, idx }) => {
                        const colDef = col as thOptions;
                        const data = row[idx];
                        return (
                          <span key={idx} className="text-[.8125rem] sm:text-[.9375rem] font-[600] text-[#171717] truncate">
                            {colDef.customTableBody ? colDef.customTableBody(data) : data}
                          </span>
                        );
                      })}
                    </div>
                    {actionsCol && (
                      <div className="shrink-0 flex items-center gap-1">
                        {(actionsCol.col as thOptions).customTableBody
                          ? (actionsCol.col as thOptions).customTableBody!(row[actionsCol.idx])
                          : row[actionsCol.idx]}
                      </div>
                    )}
                  </div>

                  {/* Card body: label : value rows */}
                  {bodyColsWithIndex.map(({ col, idx }) => {
                    const label = typeof col === "string" ? col : (col as thOptions).title;
                    const colDef = typeof col !== "string" ? (col as thOptions) : null;
                    const data = row[idx];
                    const renderedValue = colDef?.customTableBody ? colDef.customTableBody(data) : data;
                    return (
                      <div key={idx} className="flex items-center justify-between gap-4 px-3 sm:px-4 py-2 sm:py-2.5 border-b border-[#E4E7EC] last:border-b-0">
                        <span className="text-[.6875rem] sm:text-xs font-normal text-[#667085] shrink-0">{label}</span>
                        <div className="text-[.75rem] sm:text-[.8125rem] font-[500] text-[#101828] text-right min-w-0">
                          {renderedValue}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        )}

        {/* Card pagination */}
        {props?.pagination && !props.loading && !!formattedData.length && (
          <div className="flex items-center justify-between mt-4 px-1">
            <span className="text-[.6875rem] sm:text-xs font-medium text-[#202224] opacity-60">
              Showing {props?.metaData?.currentPage || 1}–{props?.metaData?.endPage || 1} of {props?.metaData?.totalRecords || 1}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => props?.metaData?.onPageChange?.(Math.max(0, (props?.metaData?.currentPage || 0) - 50 - 1) || 0)}
                disabled={props?.loading || props?.metaData?.currentPage === 1}
                className="rounded-lg border border-[#D0D5DD] p-1.5 sm:p-2 shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] disabled:cursor-not-allowed"
              >
                <Icon
                  icon="hugeicons:arrow-left-01"
                  className="w-4 h-4 sm:w-5 sm:h-5"
                  style={{ color: props?.loading || props?.metaData?.currentPage === 1 ? "#34405490" : "#344054" }}
                />
              </button>
              <button
                onClick={() => props?.metaData?.onPageChange?.(props?.metaData?.endPage || 1)}
                disabled={props.loading || props?.metaData?.endPage === props?.metaData?.currentPage}
                className="rounded-lg border border-[#D0D5DD] p-1.5 sm:p-2 shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] disabled:cursor-not-allowed"
              >
                <Icon
                  icon="hugeicons:arrow-right-01"
                  className="w-4 h-4 sm:w-5 sm:h-5"
                  style={{ color: props.loading || props?.metaData?.endPage === props?.metaData?.currentPage ? "#34405490" : "#344054" }}
                />
              </button>
            </div>
          </div>
        )}
      </div>

    </section>
  );
};

const Table = memo(DataTable);

export { Table };
