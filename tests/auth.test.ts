import { promises as fs } from 'fs';
import os from 'os';
import path from 'path';

let dataDir: string;

const mockRes = () => {
  const res: any = {
    headers: {} as Record<string, string>,
    statusCode: 200,
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

describe('auth utilities', () => {
  beforeEach(async () => {
    dataDir = await fs.mkdtemp(path.join(os.tmpdir(), 'ilo-test-'));
    await fs.mkdir(path.join(dataDir, 'data'));
    await fs.writeFile(
      path.join(dataDir, 'data', 'users.json'),
      JSON.stringify([{ username: 'user', password: 'pass', role: 'admin' }])
    );
    await fs.writeFile(path.join(dataDir, 'data', 'sessions.json'), '{}');
    process.env.DATA_DIR = dataDir;
    jest.resetModules();
  });

  afterEach(() => {
    delete process.env.DATA_DIR;
  });

  test('createSession stores session and authenticate reads it', async () => {
    const { createSession, authenticate } = await import('../src/lib/auth');

    const token = await createSession('user');
    const sessions = JSON.parse(
      await fs.readFile(path.join(dataDir, 'data', 'sessions.json'), 'utf-8')
    );
    expect(sessions[token]).toBe('user');

    const req: any = { cookies: { session: token }, headers: {} };
    const res = mockRes();
    const user = await authenticate(req, res);
    expect(user).toEqual({ username: 'user', password: 'pass', role: 'admin' });
  });
});
