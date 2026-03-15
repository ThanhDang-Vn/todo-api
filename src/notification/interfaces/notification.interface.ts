export interface INotification {
  send(task: any, user: any): Promise<boolean>;
}
