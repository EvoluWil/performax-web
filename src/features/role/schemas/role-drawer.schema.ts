import { Permission } from '@/features/role/types';
import * as yup from 'yup';

export type RoleFormDto = {
  name: string;
  description: string;
  isAdmin: boolean;
  permissions?: Permission[];
};

export const roleFormInitialValues: RoleFormDto = {
  name: '',
  description: '',
  isAdmin: false,
  permissions: [],
};

export const roleFormSchema = yup.object().shape({
  name: yup.string().required('Nome é obrigatório'),
  description: yup.string().required('Descrição é obrigatória'),
  isAdmin: yup.boolean().required('Campo obrigatório').default(false),
});
