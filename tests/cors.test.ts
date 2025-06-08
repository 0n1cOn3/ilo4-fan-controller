import { allowCors } from '../src/lib/cors';

const mockRes = () => {
  const res: any = {
    headers: {} as Record<string, string>,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(data: any) {
      this.body = data;
      return this;
    },
    setHeader(name: string, value: string) {
      this.headers[name] = value;
    },
  };
  return res;
};

test('allowCors sets headers and calls handler', async () => {
  const handler = jest.fn(async (_req: any, res: any) => {
    res.status(200).json({ ok: true });
  });
  const wrapped = allowCors(handler);
  const req: any = { method: 'GET', headers: {} };
  const res = mockRes();
  await wrapped(req, res);
  expect(res.headers['Access-Control-Allow-Origin']).toBe('*');
  expect(handler).toHaveBeenCalled();
});
