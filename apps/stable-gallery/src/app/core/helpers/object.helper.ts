import {MinMax} from "../interfaces";

export function isObjectEmpty(obj: any) {
  for(const value of Object.values(obj)) {
    if (!isEmpty(value)) {
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

export function flattenMinMax(arr: (MinMax | undefined)[]): MinMax {
  let min: number | undefined = undefined;
  let max: number | undefined = undefined;

  for (const item of arr) {
    if (!item) continue;

    if (item[0] !== undefined) {
      if (min === undefined) {
        min = item[0];
      } else if (item[0] > min) {
        min = item[0];
      }
    }
    if (item[1] !== undefined) {
      if (max === undefined) {
        max = item[1];
      } else if (item[1] < max) {
        max = item[1];
      }
    }
  }
  return [min, max];
}
