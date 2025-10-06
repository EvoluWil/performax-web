import * as yup from "yup";

export const ImpedimentSchema = yup.object().shape({
  impedimentNote: yup.string().required("Motivo é obrigatório"),
});

export const impedimentInitialValues = {
  impedimentNote: "",
};

export type ImpedimentSchemaType = yup.InferType<typeof ImpedimentSchema>;
