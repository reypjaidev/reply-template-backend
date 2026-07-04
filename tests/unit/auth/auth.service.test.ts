// tests/unit/auth/auth.service.test.ts
// Pure unit tests — usersRepository, bcrypt, and jsonwebtoken are all mocked.
// No DB, no network. Matches the Rules of Thumb: service layer has zero HTTP
// or infra knowledge, so it's tested in complete isolation from both.
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { authService } from "@/modules/auth/auth.service";
import { UnauthorizedError, ValidationError } from "@/errors/index";
import { usersRepository } from "@/modules/users/users.repository";

vi.mock("@/modules/users/users.repository", () => ({
  usersRepository: {
    emailExists: vi.fn(),
    create: vi.fn(),
    findByEmail: vi.fn(),
  },
}));

vi.mock("bcrypt", () => ({
  default: {
    hash: vi.fn(),
    compare: vi.fn(),
  },
}));

vi.mock("jsonwebtoken", () => ({
  default: {
    sign: vi.fn(() => "fake.jwt.token"),
  },
}));

const fakeUser = {
  _id: { toString: () => "user123" },
  name: "PJ",
  email: "pj@example.com",
  password: "hashed_pw",
};

describe("authService.register", () => {
  beforeEach(() => vi.clearAllMocks());

  it("throws ValidationError if the email is already taken", async () => {
    vi.mocked(usersRepository.emailExists).mockResolvedValue(true);

    await expect(
      authService.register({
        name: "PJ",
        email: "pj@example.com",
        password: "Secret1!",
      }),
    ).rejects.toThrow(ValidationError);

    expect(usersRepository.create).not.toHaveBeenCalled();
  });

  it("hashes the password before persisting and returns a token", async () => {
    vi.mocked(usersRepository.emailExists).mockResolvedValue(false);
    vi.mocked(bcrypt.hash).mockResolvedValue("hashed_pw" as never);
    vi.mocked(usersRepository.create).mockResolvedValue(fakeUser as never);

    const result = await authService.register({
      name: "PJ",
      email: "pj@example.com",
      password: "Secret1!",
    });

    expect(bcrypt.hash).toHaveBeenCalledWith("Secret1!", 12);
    expect(usersRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ password: "hashed_pw" }),
    );
    expect(result).toEqual({
      token: "fake.jwt.token",
      user: { id: "user123", name: "PJ", email: "pj@example.com" },
    });
  });

  it("never stores the plain-text password", async () => {
    vi.mocked(usersRepository.emailExists).mockResolvedValue(false);
    vi.mocked(bcrypt.hash).mockResolvedValue("hashed_pw" as never);
    vi.mocked(usersRepository.create).mockResolvedValue(fakeUser as never);

    await authService.register({
      name: "PJ",
      email: "pj@example.com",
      password: "Secret1!",
    });

    const createArg = vi.mocked(usersRepository.create).mock.calls[0][0];
    expect(createArg.password).not.toBe("Secret1!");
  });
});

describe("authService.login", () => {
  beforeEach(() => vi.clearAllMocks());

  it("throws UnauthorizedError when the user doesn't exist", async () => {
    vi.mocked(usersRepository.findByEmail).mockResolvedValue(null);

    await expect(
      authService.login({ email: "ghost@example.com", password: "whatever" }),
    ).rejects.toThrow(UnauthorizedError);
  });

  it("throws UnauthorizedError when the password doesn't match", async () => {
    vi.mocked(usersRepository.findByEmail).mockResolvedValue(fakeUser as never);
    vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

    await expect(
      authService.login({ email: "pj@example.com", password: "wrong" }),
    ).rejects.toThrow(UnauthorizedError);
  });

  it("uses the identical error message for wrong-email and wrong-password", async () => {
    vi.mocked(usersRepository.findByEmail).mockResolvedValueOnce(null);
    const wrongEmailErr = (await authService
      .login({ email: "ghost@example.com", password: "x" })
      .catch((e: Error) => e)) as Error;

    vi.mocked(usersRepository.findByEmail).mockResolvedValueOnce(fakeUser as never);
    vi.mocked(bcrypt.compare).mockResolvedValueOnce(false as never);
    const wrongPasswordErr = (await authService
      .login({ email: "pj@example.com", password: "wrong" })
      .catch((e: Error) => e)) as Error;

    expect(wrongEmailErr.message).toBe(wrongPasswordErr.message);
  });

  it("returns a token and the user on valid credentials", async () => {
    vi.mocked(usersRepository.findByEmail).mockResolvedValue(fakeUser as never);
    vi.mocked(bcrypt.compare).mockResolvedValue(true as never);

    const result = await authService.login({
      email: "pj@example.com",
      password: "Secret1!",
    });

    expect(result.token).toBe("fake.jwt.token");
    expect(result.user).toEqual({
      id: "user123",
      name: "PJ",
      email: "pj@example.com",
    });
  });
});
