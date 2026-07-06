// tests/integration/auth/auth.routes.test.ts
// Hits the real Express app (real routing, real middleware order, real
// Zod validation, real bcrypt/JWT) against an in-memory Mongo instance.
// Nothing here is mocked except the database backend itself.
import app from "@/app";
import config from "@/config/index";
import request from "supertest";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
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
  it("registers a new user, sets accessToken + refreshToken cookies, and returns only the user (never tokens or password)", async () => {
    const res = await request(app)
      .post(`${API_PREFIX}/auth/register`)
      .send(validUser);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(validUser.email);
    expect(res.body.data.user).not.toHaveProperty("password");
    expect(res.body.data).not.toHaveProperty("accessToken");
    expect(res.body.data).not.toHaveProperty("refreshToken");

    const cookies = res.headers["set-cookie"] as unknown as string[];
    expect(cookies.some((c) => c.startsWith("accessToken="))).toBe(true);
    expect(cookies.some((c) => c.startsWith("refreshToken="))).toBe(true);
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
    expect(res.body.data.user.email).toBe(validUser.email);

    const cookies = res.headers["set-cookie"] as unknown as string[];
    expect(cookies.some((c) => c.startsWith("accessToken="))).toBe(true);
    expect(cookies.some((c) => c.startsWith("refreshToken="))).toBe(true);
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
  it("rejects requests with no accessToken cookie", async () => {
    const res = await request(app).get(`${API_PREFIX}/users`);
    expect(res.status).toBe(401);
  });

  it("rejects a malformed/garbage token", async () => {
    const res = await request(app)
      .get(`${API_PREFIX}/users`)
      .set("Cookie", ["accessToken=not-a-real-token"]);
    expect(res.status).toBe(401);
  });

  it("allows access with a token from a real login", async () => {
    await request(app).post(`${API_PREFIX}/auth/register`).send(validUser);

    // supertest agent persists cookies across requests, like a browser session
    const agent = request.agent(app);
    await agent
      .post(`${API_PREFIX}/auth/login`)
      .send({ email: validUser.email, password: validUser.password });

    const res = await agent.get(`${API_PREFIX}/users`);

    expect(res.status).toBe(200);
    expect(res.body.data.email).toBe(validUser.email);
  });
});
