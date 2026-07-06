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

// pulls "name=value" (no attributes) out of a Set-Cookie header so it can be
// replayed on a follow-up request via .set("Cookie", [...])
function getCookie(res: request.Response, name: string): string {
  const raw = (res.headers["set-cookie"] as unknown as string[]).find((c) =>
    c.startsWith(`${name}=`),
  );
  if (!raw) throw new Error(`cookie "${name}" not found in response`);
  return raw.split(";")[0];
}

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

describe("POST /api/v1/auth/refresh", () => {
  it("rejects requests with no refreshToken cookie", async () => {
    const res = await request(app).post(`${API_PREFIX}/auth/refresh`);
    expect(res.status).toBe(401);
  });

  it("rejects a malformed/garbage refresh token", async () => {
    const res = await request(app)
      .post(`${API_PREFIX}/auth/refresh`)
      .set("Cookie", ["refreshToken=not-a-real-token"]);
    expect(res.status).toBe(401);
  });

  it("rotates the refresh token and issues a working access token", async () => {
    await request(app).post(`${API_PREFIX}/auth/register`).send(validUser);
    const login = await request(app)
      .post(`${API_PREFIX}/auth/login`)
      .send({ email: validUser.email, password: validUser.password });

    const oldRefreshCookie = getCookie(login, "refreshToken");

    const refreshRes = await request(app)
      .post(`${API_PREFIX}/auth/refresh`)
      .set("Cookie", [oldRefreshCookie]);

    expect(refreshRes.status).toBe(200);
    const newRefreshCookie = getCookie(refreshRes, "refreshToken");
    expect(newRefreshCookie).not.toBe(oldRefreshCookie);

    const newAccessCookie = getCookie(refreshRes, "accessToken");
    const usersRes = await request(app)
      .get(`${API_PREFIX}/users`)
      .set("Cookie", [newAccessCookie]);
    expect(usersRes.status).toBe(200);
  });

  it("detects reuse of an already-rotated refresh token and revokes the whole session", async () => {
    await request(app).post(`${API_PREFIX}/auth/register`).send(validUser);
    const login = await request(app)
      .post(`${API_PREFIX}/auth/login`)
      .send({ email: validUser.email, password: validUser.password });

    const oldRefreshCookie = getCookie(login, "refreshToken");

    const firstRefresh = await request(app)
      .post(`${API_PREFIX}/auth/refresh`)
      .set("Cookie", [oldRefreshCookie]);
    const rotatedRefreshCookie = getCookie(firstRefresh, "refreshToken");

    // replaying the token that was already rotated away is the reuse signal
    const replay = await request(app)
      .post(`${API_PREFIX}/auth/refresh`)
      .set("Cookie", [oldRefreshCookie]);
    expect(replay.status).toBe(401);

    // the legitimately-rotated-to token should now be revoked too — the
    // whole session was nuked, not just the replayed token
    const afterReuse = await request(app)
      .post(`${API_PREFIX}/auth/refresh`)
      .set("Cookie", [rotatedRefreshCookie]);
    expect(afterReuse.status).toBe(401);
  });
});

describe("POST /api/v1/auth/logout", () => {
  it("succeeds even with no refreshToken cookie", async () => {
    const res = await request(app).post(`${API_PREFIX}/auth/logout`);
    expect(res.status).toBe(200);
  });

  it("clears both cookies", async () => {
    await request(app).post(`${API_PREFIX}/auth/register`).send(validUser);
    const login = await request(app)
      .post(`${API_PREFIX}/auth/login`)
      .send({ email: validUser.email, password: validUser.password });

    const res = await request(app)
      .post(`${API_PREFIX}/auth/logout`)
      .set("Cookie", [
        getCookie(login, "accessToken"),
        getCookie(login, "refreshToken"),
      ]);

    expect(res.status).toBe(200);
    const cookies = res.headers["set-cookie"] as unknown as string[];
    // cleared cookies are re-sent with an empty value and an expiry in the past
    expect(cookies.some((c) => c.startsWith("accessToken=;"))).toBe(true);
    expect(cookies.some((c) => c.startsWith("refreshToken=;"))).toBe(true);
  });

  it("revokes the refresh token so it can no longer be used to get a new access token", async () => {
    await request(app).post(`${API_PREFIX}/auth/register`).send(validUser);
    const login = await request(app)
      .post(`${API_PREFIX}/auth/login`)
      .send({ email: validUser.email, password: validUser.password });

    const refreshCookie = getCookie(login, "refreshToken");

    await request(app)
      .post(`${API_PREFIX}/auth/logout`)
      .set("Cookie", [refreshCookie]);

    const refreshAfterLogout = await request(app)
      .post(`${API_PREFIX}/auth/refresh`)
      .set("Cookie", [refreshCookie]);

    expect(refreshAfterLogout.status).toBe(401);
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
