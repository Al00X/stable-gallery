import {MinMax} from "../interfaces";

export function isObjectEmpty(obj: any) {
  for(const value of Object.values(obj)) {
    if (isEmpty(value)) {
      return false;
    }
  }
  return true;
}

export function isEmpty(value: any): boolean {
  if (value instanceof Array) {
    return !value.some(t => !isEmpty(t));
  }
  if (value !== undefined && value !== null && value !== '') {
    return false;
  }
  return true;
}

export function extractNonEmptyEntries<T extends object>(object: T): Partial<T> {
  return Object.entries(object).filter(([key, value]) => !isEmpty(value)).reduce((pre, cur) => {
    pre[cur[0]] = cur[1];
    return pre;
  }, {} as any);
}

export function formatMinMax(arr: MinMax) {
  return arr[0] !== undefined && arr[1] !== undefined ? `${arr[0]} <> ${arr[1]}` : arr[0] !== undefined ? `< ${arr[0]}` : arr[1] !== undefined ? `${arr[1]} > ` : '';
}
