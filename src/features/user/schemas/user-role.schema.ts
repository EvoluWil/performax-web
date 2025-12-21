import * as yup from "yup";

export type UserRoleFormDto = {
  roleId: string;
};

export const userRoleFormInitialValues: UserRoleFormDto = {
  roleId: "",
};

export const userRoleFormSchema = yup.object().shape({
  roleId: yup.string().required("Cargo é obrigatório"),
});
