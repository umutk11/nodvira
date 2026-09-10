import assert from "node:assert/strict";
import test from "node:test";
import express from "express";
import bcrypt from "bcryptjs";
import { database } from "../src/db.js";
import { adminAuthRouter } from "../src/routes/admin-auth.js";

async function withAuthServer(queryHandler, callback) {
  const originalQuery = database.query;
  database.query = queryHandler;
  const app = express();
  app.use(express.json());
  app.use((request, _response, next) => {
    request.session = {
      regenerate(done) { done(); },
      save(done) { done(); },
      destroy(done) { done(); },
    };
    next();
  });
  app.use("/api/admin/auth", adminAuthRouter);
  const server = app.listen(0, "127.0.0.1");
  await new Promise((resolve, reject) => {
    server.once("listening", resolve);
    server.once("error", reject);
  });
  try {
    await callback(`http://127.0.0.1:${server.address().port}`);
  } finally {
    await new Promise((resolve) => server.close(resolve));
    database.query = originalQuery;
  }
}

test("admin kullanıcı adı ve parola ile giriş yapar", async () => {
  const passwordHash = await bcrypt.hash("guvenli-test-parolasi", 4);
  const calls = [];
  await withAuthServer(async (sql, parameters) => {
    calls.push({ sql, parameters });
    if (sql.includes("FROM admins")) {
      return { rows: [{
        id: 7,
        username: "nodvira_admin",
        password_hash: passwordHash,
        display_name: "NODVIRA Yönetici",
        role: "admin",
        is_active: true,
        failed_login_count: 0,
        locked_until: null,
      }] };
    }
    return { rows: [] };
  }, async (base) => {
    const response = await fetch(`${base}/api/admin/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "NODVIRA_ADMIN", password: "guvenli-test-parolasi" }),
    });
    assert.equal(response.status, 200);
    const body = await response.json();
    assert.equal(body.admin.username, "nodvira_admin");
    assert.equal(body.admin.email, undefined);
    assert.deepEqual(calls[0].parameters, ["nodvira_admin"]);
  });
});

test("admin girişinde e-posta biçimini kullanıcı adı olarak kabul etmez", async () => {
  let queried = false;
  await withAuthServer(async () => { queried = true; return { rows: [] }; }, async (base) => {
    const response = await fetch(`${base}/api/admin/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "admin@example.com", password: "guvenli-test-parolasi" }),
    });
    assert.equal(response.status, 401);
    assert.equal(queried, false);
  });
});
