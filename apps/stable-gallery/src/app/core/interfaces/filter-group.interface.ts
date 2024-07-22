import {ImageQueryModel} from "../db";

export interface FilterGroup {
  index: number;
  name: string;
  filters: Partial<ImageQueryModel>;
}
