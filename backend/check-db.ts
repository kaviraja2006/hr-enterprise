
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

async function checkDb() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    const roles = await prisma.role.findMany();
    const rolePermissions = await prisma.rolePermission.findMany({
      include: {
        role: true,
        permission: true
      }
    });
    
    const adminRole = roles.find(r => r.name === 'admin');
    if (adminRole) {
      const adminPerms = rolePermissions.filter(rp => rp.roleId === adminRole.id);
      console.log(`Admin has ${adminPerms.length} permissions:`);
      const permStrings = adminPerms.map(rp => `${rp.permission.resource}:${rp.permission.action}`).sort();
      console.log(JSON.stringify(permStrings, null, 2));
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

checkDb();
