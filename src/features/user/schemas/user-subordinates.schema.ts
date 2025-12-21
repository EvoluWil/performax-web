import * as yup from "yup";

export type UserSubordinatesFormDto = {
  targetIds: string[];
};

export const userSubordinatesFormInitialValues: UserSubordinatesFormDto = {
  targetIds: [],
};

export const userSubordinatesFormSchema = yup.object().shape({
  targetIds: yup.array().of(yup.string()),
}) as any;
