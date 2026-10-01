import request from 'supertest';
// Bridging from root/tests into root/auth-service/src
import {redisClient} from '../auth-service/src/config/redis'; 
import db from '../auth-service/src/config/db'; 

let app: any;

// Mock payload for consistency
const testUser = {
  name: 'Automated Tester',
  email: 'test@system.local',
  password: 'SuperSecurePassword123!'
};

describe('Authentication API', () => {
    
  
  // 1. Boot infrastructure and guarantee a clean database slate
  beforeAll(async () => {
    if (!redisClient.isOpen) await redisClient.connect();
    
    // Dynamically import the app using the updated path
    const appModule = await import('../auth-service/src/app');
    app = appModule.default;

    // Wipe any existing test user before starting to prevent unique constraint errors
    await db.query('DELETE FROM users WHERE email = $1', [testUser.email]);
  });
  
  beforeEach(async () => {
    if (redisClient.isOpen) {
      await redisClient.flushDb();
    }
  });

  // 2. Clean up and sever connections
  afterAll(async () => {
    await db.query('DELETE FROM users WHERE email = $1', [testUser.email]);
    if (redisClient.isOpen) await redisClient.disconnect();
    
    // Explicitly close the Postgres pool so Jest can exit cleanly
    await db.end(); 
  });

  // 3. The Live Fire Tests
  describe('POST /auth/register', () => {
    it('should successfully register a new user', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send(testUser);
      
      expect([200, 201]).toContain(response.status); 
      expect(response.body).toHaveProperty('message');
    });

    it('should reject registration with an existing email', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send(testUser);
      
      expect(response.status).toBe(409); // Or 409 Conflict depending on your controller
    });
  });

  describe('POST /auth/login', () => {
    it('should successfully login and return tokens', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        });
      
      expect(response.status).toBe(200);
      
      // Assert against Divyanshu's exact API wrapper structure
      expect(response.body).toHaveProperty('error', false);
      expect(response.body).toHaveProperty('message', 'Login successful');
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('email', testUser.email);

      // Optional: If you are passing the JWT in a cookie, uncomment the line below to test it
      // expect(response.headers['set-cookie']).toBeDefined();
    });
  });
});