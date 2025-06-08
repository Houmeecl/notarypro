import { emailService } from './email-service';
import { db } from '../db';
import { documents, users } from '@shared/schema';
import { sql } from 'drizzle-orm';
import { format } from 'date-fns';

async function buildReport(period: 'daily' | 'weekly' | 'monthly'): Promise<string> {
  const now = new Date();
  let from: Date;
  switch (period) {
    case 'weekly':
      from = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
      break;
    case 'monthly':
      from = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
      break;
    default:
      from = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
  }

  const [documentsCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(documents)
    .where(sql`created_at >= ${from}`);

  const [usersCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(users)
    .where(sql`created_at >= ${from}`);

  const title = period === 'daily' ? 'Diario' : period === 'weekly' ? 'Semanal' : 'Mensual';
  return `Reporte ${title} de NotaryPro\nDocumentos creados: ${documentsCount?.count || 0}\nUsuarios registrados: ${usersCount?.count || 0}\nGenerado el ${format(now, 'yyyy-MM-dd HH:mm')}`;
}

async function sendReport(period: 'daily' | 'weekly' | 'monthly') {
  const body = await buildReport(period);
  await emailService.sendEmail({
    to: process.env.ADMIN_EMAIL || 'admin@notarypro.cl',
    subject: `Reporte ${period} NotaryPro`,
    text: body,
  });
}

export function startReportScheduler() {
  const interval = 60 * 1000; // check every minute
  setInterval(async () => {
    const now = new Date();
    if (now.getHours() === 8 && now.getMinutes() === 0) {
      await sendReport('daily');
      if (now.getDay() === 1) {
        await sendReport('weekly');
      }
      if (now.getDate() === 1) {
        await sendReport('monthly');
      }
    }
  }, interval);
}
