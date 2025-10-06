import { api } from "@/config/api";
import { BaseCompanyService } from "@/services/base-url.service";
import { BudgetTypeFormDto } from "../schemas/budget-type.schema";
import { BudgetType } from "../types/budget-type";

class BudgetTypeService extends BaseCompanyService {
  private path = "budget-types";

  async get() {
    const { data } = await api.get<BudgetType[]>(this.getUrlBase(this.path));
    return data;
  }

  async getById(id: string): Promise<BudgetType> {
    const { data } = await api.get<BudgetType>(
      `${this.getUrlBase(this.path)}/${id}`
    );
    return data;
  }

  async create(payload: BudgetTypeFormDto): Promise<BudgetType> {
    const { data } = await api.post<BudgetType>(
      this.getUrlBase(this.path),
      payload
    );
    return data;
  }

  async update(id: string, payload: BudgetTypeFormDto): Promise<BudgetType> {
    const { data } = await api.put<BudgetType>(
      `${this.getUrlBase(this.path)}/${id}`,
      payload
    );
    return data;
  }

  async delete(id: string): Promise<BudgetType> {
    const { data } = await api.delete<BudgetType>(
      `${this.getUrlBase(this.path)}/${id}`
    );
    return data;
  }
}

export const budgetTypeService = new BudgetTypeService();
