import { Class } from '../interfaces';

export async function lazyLoad<T extends object>(component: Promise<T>, selector?: (o: T) => Class): Promise<Class> {
  const entry = await component;
  if (selector) return selector(entry);
  const props = Object.values(entry);
  if (props.length) return props[0] as Class;
  console.error('LAZY LOAD ERROR', entry);
  throw new Error('Entry has no exported components!!');
}
