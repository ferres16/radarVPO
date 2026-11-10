import * as bcrypt from 'bcryptjs';
import { hashRefreshToken, refreshTokenMatches } from '../refresh-token.util';

describe('refresh token hashing', () => {
  const header = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9';
  const tokenA = `${header}.eyJzdWIiOiJ1c2VyMSIsInNlc3Npb25JZCI6ImEiLCJqdGkiOiIxIn0.sigA`;
  const tokenB = `${header}.eyJzdWIiOiJ1c2VyMSIsInNlc3Npb25JZCI6ImEiLCJqdGkiOiIyIn0.sigB`;

  it('distinguishes tokens that share the first 72 bytes', async () => {
    expect(tokenA.slice(0, 72)).toBe(tokenB.slice(0, 72));
    const stored = hashRefreshToken(tokenA);
    expect(await refreshTokenMatches(tokenA, stored)).toBe(true);
    expect(await refreshTokenMatches(tokenB, stored)).toBe(false);
  });

  it('still accepts legacy bcrypt hashes', async () => {
    const legacy = await bcrypt.hash(tokenA, 4);
    expect(await refreshTokenMatches(tokenA, legacy)).toBe(true);
  });
});
