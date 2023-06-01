export interface Inbox {
  filter?: string;
  mpp?: number;
  page?: number;
  loading?: boolean;
  unreadEvents?: boolean;
  unreadDiplomacy?: boolean;
  messages?: {
    [key: string]: unknown;
  };
  trigger?: (event: string, data: unknown) => void;
}
