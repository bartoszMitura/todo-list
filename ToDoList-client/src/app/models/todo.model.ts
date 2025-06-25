export enum TaskStatus {
  NotStarted = 0,
  InProgress = 1,
  Completed = 2,
  Delayed = 3,
  Cancelled = 4
}

export interface TodoItem {
  id?: number;
  title: string;
  isCompleted: boolean;
  userId?: string;
  createdAt?: Date;
  updatedAt?: Date;
  startTime?: Date;
  endTime?: Date;
  category?: string;
  status?: TaskStatus;
}
