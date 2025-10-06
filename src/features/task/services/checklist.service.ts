import { api } from "@/config/api";
import {
  ChecklistItemDto,
  ChecklistItemUpdateDto,
} from "@/features/task/types";
import { BaseCompanyService } from "@/services/base-url.service";

class ChecklistService extends BaseCompanyService {
  private path = "checklists";

  async update(
    itemId: string,
    checklistId: string,
    item: ChecklistItemUpdateDto
  ): Promise<ChecklistItemDto> {
    const { data } = await api.put<ChecklistItemDto>(
      `${this.getUrlBase(this.path)}/${checklistId}/items/${itemId}`,
      item
    );
    return data;
  }
}

export const checklistService = new ChecklistService();
