import type { VercelRequest, VercelResponse } from '@vercel/node';
// @ts-ignore
import { updateAccessKey } from '../_db.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const adminPwd = req.headers['x-admin-password'];
  if (adminPwd !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { id, maxUses, expiresAt } = req.body;

  if (!id) return res.status(400).json({ error: 'ID is required' });

  try {
    const updatedKey = await updateAccessKey(Number(id), Number(maxUses), expiresAt || null);
    return res.status(200).json(updatedKey);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}