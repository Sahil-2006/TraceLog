import bcrypt from "bcryptjs";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function provisionAdmin(prisma) {
  const email = process.env.TRACELOG_ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.TRACELOG_ADMIN_PASSWORD;

  if (!email || !emailPattern.test(email)) {
    throw new Error("Set TRACELOG_ADMIN_EMAIL to the initial administrator's email address.");
  }
  if (!password || password.length < 12 || Buffer.byteLength(password, "utf8") > 72) {
    throw new Error("Set TRACELOG_ADMIN_PASSWORD to a unique password of at least 12 characters and no more than 72 UTF-8 bytes.");
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    if (existing.role === "ADMIN") {
      console.log("An administrator already exists; no account was changed.");
      return;
    }
    if (process.env.TRACELOG_PROMOTE_EXISTING !== "true") {
      throw new Error("That account already exists. Set TRACELOG_PROMOTE_EXISTING=true only after verifying its owner.");
    }
    await prisma.user.update({ where: { email }, data: { role: "ADMIN" } });
    console.log("The verified existing account was promoted. Its password was not changed.");
    return;
  }

  await prisma.user.create({
    data: {
      email,
      name: "TraceLog Administrator",
      password: await bcrypt.hash(password, 12),
      role: "ADMIN",
      emailVerified: true,
    },
  });
  console.log("Administrator created. The supplied credentials were not printed.");
}
