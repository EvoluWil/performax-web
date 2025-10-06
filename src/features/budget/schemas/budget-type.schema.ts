import * as yup from "yup";

export type BudgetTypeFormDto = {
  name: string;
  needApprove: boolean;
};

export const budgetTypeFormInitialValues: BudgetTypeFormDto = {
  name: "",
  needApprove: false,
};

export const budgetTypeFormSchema = yup.object().shape({
  name: yup.string().required("Nome é obrigatório"),
  needApprove: yup.boolean().required("Aprovação é obrigatória").default(false),
});
