
import { PrismaClient } from '@prisma/client';

async function checkPermissions() {
  const prisma = new PrismaClient();
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'admin@hrenterprise.com' },
      include: {
        role: {
          include: {
            permissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      console.log('User not found');
      return;
    }

    console.log('User Role:', user.role?.name);
    const permissions = user.role?.permissions.map(
      (rp: any) => `${rp.permission.resource}:${rp.permission.action}`,
    ) || [];

    console.log('User Permissions:', JSON.stringify(permissions, null, 2));
    
    const requiredPermission = 'analytics:read';
    console.log(`Checking for '${requiredPermission}':`, permissions.includes(requiredPermission));

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkPermissions();
