import * as yup from "yup";

export const ConclusionSchema = yup.object().shape({
  conclusionNote: yup.string().required("Nota de conclusão é obrigatória"),
});

export type ConclusionSchemaType = {
  conclusionNote: string;
  files?: File[];
};

export const conclusionInitialValues: ConclusionSchemaType = {
  conclusionNote: "",
  files: [] as File[],
};
