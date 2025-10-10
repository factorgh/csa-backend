import { Request, Response } from "express";
import config from "../config";
import { sendEmail } from "../services/notification.service";

export async function contact(req: Request, res: Response) {
  const { name, email, subject, message } = req.body as any;
  // Send to admin/support
  const adminHtml = `<p>New support message</p>
  <p><strong>Name:</strong> ${name || "N/A"}</p>
  <p><strong>Email:</strong> ${email || "N/A"}</p>
  <p><strong>Subject:</strong> ${subject || "N/A"}</p>
  <p><strong>Message:</strong><br/>${(message || "").replace(/\n/g, "<br/>")}</p>`;
  try {
    await sendEmail(config.admin.email, `Support: ${subject || "No subject"}`, adminHtml);
  } catch (e) {
    // log silent; don't fail user unnecessarily
    // eslint-disable-next-line no-console
    console.error("Failed to send admin support email", e);
  }

  // Acknowledge to user if they provided email
  if (email) {
    const userHtml = `<p>Hi ${name || ""},</p>
    <p>We have received your message and will get back to you shortly.</p>
    <p><em>Summary:</em> ${subject || "No subject"}</p>`;
    try {
      await sendEmail(email, "We received your support request", userHtml);
    } catch {
      // ignore
    }
  }

  res.status(200).json({ success: true, message: "Message received" });
}
