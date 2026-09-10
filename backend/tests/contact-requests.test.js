import assert from "node:assert/strict";
import test from "node:test";
import { normalizeTurkishMobilePhone } from "../src/routes/contact-requests.js";

test("Türk mobil telefonlarını tek biçime dönüştürür", () => {
  for (const value of [
    "+905555555555",
    "+90 555 555 55 55",
    "05555555555",
    "0555 555 55 55",
    "5555555555",
    "555 555 55 55",
  ]) {
    assert.equal(normalizeTurkishMobilePhone(value), "+90 555 555 55 55");
  }
});

test("geçersiz telefon biçimlerini reddeder", () => {
  assert.equal(normalizeTurkishMobilePhone(""), undefined);
  for (const value of [
    "+90 (555) 555-55-55",
    "90 555 555 55 55",
    "444 0 444",
    "555 555 55 5",
    "telefon",
  ]) {
    assert.equal(normalizeTurkishMobilePhone(value), null);
  }
});
