import { assertFails, assertSucceeds, initializeTestEnvironment } from "@firebase/rules-unit-testing";
import { readFileSync } from "fs";
import { describe, it, beforeAll, afterAll } from "vitest";

let testEnv: any;
const describeWithEmulator = process.env.FIRESTORE_EMULATOR_HOST ? describe : describe.skip;

describeWithEmulator("Firestore Rules - Red Team Audit", () => {
  beforeAll(async () => {
    testEnv = await initializeTestEnvironment({
      projectId: "demo-gym-test",
      firestore: {
        rules: readFileSync("firestore.rules", "utf8"),
      },
    });
  });

  afterAll(async () => {
    await testEnv?.cleanup();
  });

  // 1. Shadow Update
  it("Shadow Update Test: socio cannot add a ghost field", async () => {
    const db = testEnv.authenticatedContext("user123", { email_verified: true }).firestore();
    await testEnv.withSecurityRulesDisabled(async (context: any) => {
      await context.firestore().doc("users/user123").set({
        email: "user@test.com", role: "socio", firstName: "A", lastName: "B", 
        status: "active", createdAt: "2023-01-01T00:00:00Z", updatedAt: "2023-01-01T00:00:00Z"
      });
    });
    const updatePromise = db.doc("users/user123").update({
      ghostField: true,
      updatedAt: "2023-01-02T00:00:00Z"
    });
    await assertFails(updatePromise);
  });

  // 2. Email Spoofing
  it("Spoof Attack: Unverified emails are blocked", async () => {
    const db = testEnv.authenticatedContext("admin1", { email: "gino.pieretti00@gmail.com", email_verified: false }).firestore();
    const readPromise = db.collection("classes").get();
    await assertFails(readPromise);
  });

  // 3. Blanket PII test
  it("PII Blanket view: socio cannot read another socio's private info", async () => {
    const db = testEnv.authenticatedContext("user2", { email_verified: true }).firestore();
    const readPromise = db.doc("users/user123/private/info").get();
    await assertFails(readPromise);
  });

  // 4. Value Poisoning
  it("Value Poisoning: updating type constraints blocks write", async () => {
    const dbAdmin = testEnv.authenticatedContext("admin1", { email: "gino.pieretti00@gmail.com", email_verified: true }).firestore();
    const writePromise = dbAdmin.doc("classes/123").set({
      title: 12345, // Intentionally not a string
      instructorId: "prof1",
      capacity: 10,
      enrolled: 0,
      startTime: "T",
      endTime: "T",
      status: "scheduled",
      createdAt: "T"
    });
    await assertFails(writePromise);
  });
});
