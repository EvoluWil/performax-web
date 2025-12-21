import * as yup from "yup";

export type UserClientsFormDto = {
  clientIds: string[];
};

export const userClientsFormInitialValues: UserClientsFormDto = {
  clientIds: [],
};

export const userClientsFormSchema = yup.object().shape({
  clientIds: yup.array().of(yup.string()),
}) as any;
