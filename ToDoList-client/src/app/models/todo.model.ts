export interface TodoItem {
  id?: number;
  title: string;
  isCompleted: boolean;
  userId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
