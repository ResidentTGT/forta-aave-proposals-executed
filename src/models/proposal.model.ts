export class Proposal {
  id: number;
  executed: boolean;
  creator: string;
  executor: string;

  constructor(obj: any) {
    this.id = +obj.id.toString();
    this.executed = obj.executed;
    this.creator = obj.creator;
    this.executor = obj.executor;
  }
}
