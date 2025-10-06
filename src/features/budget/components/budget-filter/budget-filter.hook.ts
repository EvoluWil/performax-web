import { Option } from "@/components/inputs/select-input/select-input";
import { useClientsQuery } from "@/features/client/hooks";
import { useUsersQuery } from "@/features/user/hooks";
import { formatterSelectOptions } from "@/utils/select";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { useBudgetTypesQuery } from "../../hooks/queries/budget-types.query";
import {
  BudgetFilterDto,
  budgetFilterInitialValues,
} from "../../schemas/budget-filter.schema";

type Options = {
  types: Option[];
  clients: Option[];
  users: Option[];
};

export function useBudgetFilter(onFilter: (data: BudgetFilterDto) => void) {
  const { data: budgetTypesData } = useBudgetTypesQuery();
  const { data: clientsData } = useClientsQuery();
  const { data: usersData } = useUsersQuery();
  const { control, handleSubmit, setValue, watch } = useForm<BudgetFilterDto>({
    defaultValues: budgetFilterInitialValues,
  });

  const [pending, financial, closed] = watch([
    "pending",
    "financial",
    "closed",
  ]);

  const statusFilters = useMemo(() => {
    const groups: string[] = [];
    if (pending) groups.push("PENDING");
    if (financial) groups.push("FINANCIAL");
    if (closed) groups.push("COMPLETED");
    return groups;
  }, [pending, financial, closed]);

  const options: Options = useMemo(() => {
    const types = formatterSelectOptions(budgetTypesData || [], "id", "name");
    const clients = formatterSelectOptions(
      clientsData?.data || [],
      "id",
      "name"
    );
    const users = formatterSelectOptions(usersData?.data || [], "id", "name");
    return { types, clients, users };
  }, [budgetTypesData, clientsData, usersData]);

  const hasUserFilter = true;

  const handleUpdateStatuses = (selectedStatuses: string[]) => {
    setValue("pending", selectedStatuses.includes("PENDING"));
    setValue("financial", selectedStatuses.includes("FINANCIAL"));
    setValue("closed", selectedStatuses.includes("COMPLETED"));
    handleFilter();
  };

  const handleFilter = handleSubmit(onFilter);

  return {
    control,
    options,
    hasUserFilter,
    handleFilter,
    handleUpdateStatuses,
    statusFilters,
  };
}
