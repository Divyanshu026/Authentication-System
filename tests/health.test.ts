import request from 'supertest';
// Adjust this import path to point to your actual Redis client configuration file
import {redisClient} from '../auth-service/src/config/redis.js'; 

let app: any;

describe('System Health Check', () => {
  
  // 1. Boot infrastructure BEFORE loading the Express app
  beforeAll(async () => {
    if (!redisClient.isOpen) {
      await redisClient.connect();
    }
    
    // Dynamically import the app only after Redis is actively listening
    const appModule = await import('../auth-service/src/app');
    app = appModule.default;
  });

  // 2. Teardown infrastructure AFTER tests to exit cleanly
  afterAll(async () => {
    if (redisClient.isOpen) {
      await redisClient.disconnect();
    }
  });

  it('should return a 200 OK status from the /health endpoint', async () => {
    const response = await request(app).get('/health');
    
    // Updated to match your exact server response
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', 'Server is up'); 
  });
});