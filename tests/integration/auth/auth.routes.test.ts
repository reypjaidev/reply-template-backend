// tests/integration/auth/auth.routes.test.ts
// Hits the real Express app (real routing, real middleware order, real
// Zod validation, real bcrypt/JWT) against an in-memory Mongo instance.
// Nothing here is mocked except the database backend itself.
import request from "supertest";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import app from "../../../src/app.ts";
import config from "../../../src/config/index.ts";
import { clearTestDB, closeTestDB, connectTestDB } from "../../helpers/db.ts";

const API_PREFIX = config.api.prefix;
beforeAll(async () => {
  await connectTestDB();
});

afterEach(async () => {
  await clearTestDB();
});

afterAll(async () => {
  await closeTestDB();
});

const validUser = {
  name: "PJ Baliguat",
  email: "pj@example.com",
  password: "Secret123!",
};

describe("POST /api/v1/auth/register", () => {
  it("registers a new user and returns a token + user, never the password", async () => {
    const res = await request(app)
      .post(`${API_PREFIX}/auth/register`)
      .send(validUser);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.email).toBe(validUser.email);
    expect(res.body.data.user).not.toHaveProperty("password");
  });

  it("rejects a duplicate email with 400", async () => {
    await request(app).post(`${API_PREFIX}/auth/register`).send(validUser);
    const res = await request(app)
      .post(`${API_PREFIX}/auth/register`)
      .send(validUser);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("rejects a password that fails the complexity rules", async () => {
    const res = await request(app)
      .post(`${API_PREFIX}/auth/register`)
      .send({ ...validUser, email: "weak@example.com", password: "weak" });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("rejects a malformed email", async () => {
    const res = await request(app)
      .post(`${API_PREFIX}/auth/register`)
      .send({ ...validUser, email: "not-an-email" });

    expect(res.status).toBe(400);
  });
});

describe("POST /api/v1/auth/login", () => {
  it("logs in with correct credentials", async () => {
    await request(app).post(`${API_PREFIX}/auth/register`).send(validUser);

    const res = await request(app)
      .post(`${API_PREFIX}/auth/login`)
      .send({ email: validUser.email, password: validUser.password });

    expect(res.status).toBe(200);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.email).toBe(validUser.email);
  });

  it("returns the identical error for wrong password and unknown email", async () => {
    await request(app).post(`${API_PREFIX}/auth/register`).send(validUser);

    const wrongPassword = await request(app)
      .post(`${API_PREFIX}/auth/login`)
      .send({ email: validUser.email, password: "WrongPass1!" });

    const unknownEmail = await request(app)
      .post(`${API_PREFIX}/auth/login`)
      .send({ email: "ghost@example.com", password: "WrongPass1!" });

    expect(wrongPassword.status).toBe(401);
    expect(unknownEmail.status).toBe(401);
    expect(wrongPassword.body.error).toBe(unknownEmail.body.error);
  });
});

describe("GET /api/users (protected route)", () => {
  it("rejects requests with no Authorization header", async () => {
    const res = await request(app).get(`${API_PREFIX}/users`);
    expect(res.status).toBe(401);
  });

  it("rejects a malformed/garbage token", async () => {
    const res = await request(app)
      .get(`${API_PREFIX}/users`)
      .set("Authorization", "Bearer not-a-real-token");
    expect(res.status).toBe(401);
  });

  it("allows access with a token from a real login", async () => {
    await request(app).post(`${API_PREFIX}/auth/register`).send(validUser);
    const login = await request(app)
      .post(`${API_PREFIX}/auth/login`)
      .send({ email: validUser.email, password: validUser.password });

    const token = login.body.data.token;
    const res = await request(app)
      .get("/api/v1/users")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.email).toBe(validUser.email);
  });
});
