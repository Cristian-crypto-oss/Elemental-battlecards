import { JwtTokenService } from '../../services/JwtTokenService';

describe('JwtTokenService', () => {
  it('should throw when secret is empty string', () => {
    expect(() => new JwtTokenService('')).toThrow('JWT_SECRET es obligatorio');
  });

  it('should throw when secret is undefined', () => {
    expect(() => new JwtTokenService(undefined as unknown as string)).toThrow();
  });

  it('should construct successfully with a valid secret', () => {
    expect(() => new JwtTokenService('my-secret')).not.toThrow();
  });
});
