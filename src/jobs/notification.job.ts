// Placeholder async notification job; in production use a queue (Bull, RabbitMQ, etc.)
import { sendEmail } from '../services/notification.service';

export async function notifyStatusChange(email: string, subject: string, body: string) {
  await sendEmail(email, subject, `<p>${body}</p>`);
}
