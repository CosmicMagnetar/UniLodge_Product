import { AuthService } from '../../src/services';

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(() => {
    authService = new AuthService();
  });

  it('should authenticate a valid user', async () => {
    const loginRequest = {
      email: 'user@example.com',
      password: 'password123',
    };

    const response = await authService.login(loginRequest);

    expect(response).toBeDefined();
    expect(response.token).toBeDefined();
    expect(response.user.email).toBe(loginRequest.email);
  });

  it('should throw an error for invalid credentials', async () => {
    const loginRequest = {
      email: 'user@example.com',
      password: 'wrongpassword',
    };

    await expect(authService.login(loginRequest)).rejects.toThrow('Invalid credentials');
  });

  it('should register a new user', async () => {
    const registerRequest = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      role: 'user' as 'user' | 'warden',
    };

    const user = await authService.register(registerRequest);

    expect(user).toBeDefined();
    expect(user.email).toBe(registerRequest.email);
    expect(user.name).toBe(registerRequest.name);
  });
});
