import { SortEvent } from 'primeng/api';

export class TableHelper {
  public static sortTableData<T>(event: SortEvent): void {
    type Data = {
      [k: string]: T;
    };
    const field = event.field;
    const order = event.order;
    if (!field || !order) {
      console.error('Sort event does not have a valid field or order');
      return;
    }
    event.data?.sort((data1: Data, data2: Data) => {
      let value1 = data1[field];
      let value2 = data2[field];
      let result;
      if (!value1 && !value2) result = 0;
      else if (!value1 && !!value2) result = -1;
      else if (!!value1 && !value2) result = 1;
      else if (typeof value1 === 'string' && typeof value2 === 'string')
        result = value1.localeCompare(value2);
      else result = value1 < value2 ? -1 : value1 > value2 ? 1 : 0;

      return order * result;
    });
  }
}
