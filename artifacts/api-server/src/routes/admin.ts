import { Router, type IRouter } from "express";
import { AdminLoginBody, AdminLoginResponse, GetAdminSessionResponse } from "@workspace/api-zod";

const router: IRouter = Router();

router.post("/admin/login", (req, res) => {
  const parsed = AdminLoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Missing or invalid password" });
    return;
  }

  const adminPassword = process.env["ADMIN_PASSWORD"];
  if (!adminPassword) {
    req.log.error("ADMIN_PASSWORD is not configured");
    res.status(500).json({ error: "Admin login is not configured" });
    return;
  }

  if (parsed.data.password !== adminPassword) {
    res.status(401).json({ error: "Invalid password" });
    return;
  }

  req.session.isAdmin = true;
  res.json(AdminLoginResponse.parse({ authenticated: true }));
});

router.post("/admin/logout", (req, res) => {
  req.session.destroy(() => {
    res.status(204).end();
  });
});

router.get("/admin/session", (req, res) => {
  res.json(GetAdminSessionResponse.parse({ authenticated: !!req.session?.isAdmin }));
});

export default router;
