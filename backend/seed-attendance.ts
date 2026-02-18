
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import 'dotenv/config';

async function seedAttendance() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get all active employees
    const employees = await prisma.employee.findMany({
      where: { employmentStatus: 'active' },
      select: { id: true }
    });

    console.log(`Found ${employees.length} active employees.`);

    // Clear existing attendance for today
    await prisma.attendance.deleteMany({
      where: {
        date: today
      }
    });

    console.log('Cleared existing attendance for today.');

    const statusOptions = ['present', 'present', 'present', 'present', 'late', 'absent', 'on-leave', 'half-day'];
    
    // Create attendance records
    for (const emp of employees) {
      const status = statusOptions[Math.floor(Math.random() * statusOptions.length)];
      let checkIn = new Date(today);
      let checkOut = new Date(today);
      let workMinutes = 480; 

      if (status === 'present') {
        checkIn.setHours(9, 0, 0);
        checkOut.setHours(18, 0, 0);
      } else if (status === 'late') {
        checkIn.setHours(10, 30, 0);
        checkOut.setHours(18, 0, 0);
        workMinutes = 390;
      } else if (status === 'half-day') {
        checkIn.setHours(9, 0, 0);
        checkOut.setHours(13, 0, 0);
        workMinutes = 240;
      } else {
        // absent, on-leave
        workMinutes = 0;
      }
      
      await prisma.attendance.create({
        data: {
          employeeId: emp.id,
          date: today,
          status,
          checkIn: ['absent', 'on-leave'].includes(status) ? null : checkIn,
          checkOut: ['absent', 'on-leave'].includes(status) ? null : checkOut,
          workMinutes,
          overtimeMinutes: 0
        }
      });
    }

    console.log(`✅ Seeded attendance for ${employees.length} employees.`);

  } catch (error) {
    console.error('Error seeding attendance:', error);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

seedAttendance();
