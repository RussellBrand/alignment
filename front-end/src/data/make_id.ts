let last_id: number = 1;
type ID = string;

export function make_id(label?: string, n?: number): ID {
  if (n === undefined) {
    n = last_id++;
  }
  if (label === undefined) {
    label = "unlabeled";
  }
  label = label.trim().substring(0, 6);
  return `${label}_${n}` as ID;
}
