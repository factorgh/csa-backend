import { stringify } from 'csv-stringify';

export function toCSV(rows: any[], columns?: string[]): Promise<string> {
  return new Promise((resolve, reject) => {
    stringify(rows, { header: true, columns }, (err, output) => {
      if (err) return reject(err);
      resolve(output);
    });
  });
}
