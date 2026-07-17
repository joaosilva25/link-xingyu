import type { IncomingMessage } from 'node:http';
import Busboy from 'busboy';

export interface ParsedMultipart {
  fields: Record<string, string>;
  file?: {
    buffer: Buffer;
    mimeType: string;
  };
}

export function parseMultipart(req: IncomingMessage): Promise<ParsedMultipart> {
  return new Promise((resolve, reject) => {
    const bb = Busboy({ headers: req.headers });
    const fields: Record<string, string> = {};
    let file: ParsedMultipart['file'];

    bb.on('file', (_fieldname, stream, info) => {
      const chunks: Buffer[] = [];

      stream.on('data', (chunk: Buffer) => chunks.push(chunk));
      stream.on('end', () => {
        file = {
          buffer: Buffer.concat(chunks),
          mimeType: info.mimeType,
        };
      });
    });

    bb.on('field', (name, value) => {
      fields[name] = value;
    });

    bb.on('finish', () => resolve({ fields, file }));
    bb.on('error', reject);

    req.pipe(bb);
  });
}
