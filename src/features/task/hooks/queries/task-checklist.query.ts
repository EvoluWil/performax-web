import { checklistService } from "@/features/task/services";
import { useMutation } from "@tanstack/react-query";
import { ChecklistItemDto, ChecklistItemUpdateDto } from "../../types";

type ChecklistItemMutationInput = {
  checklistId: string;
  itemId: string;
  data: ChecklistItemUpdateDto;
};

export const useChecklistMutation = () => {
  const mutationFn = async (
    input: ChecklistItemMutationInput
  ): Promise<ChecklistItemDto> => {
    return checklistService.update(input.itemId, input.checklistId, input.data);
  };

  return useMutation<ChecklistItemDto, Error, ChecklistItemMutationInput>({
    mutationFn,
  });
};
