import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateLeaveApprovals() {
  console.log('🔄 Updating leave approvals to use admin as approver...\n');

  try {
    // Get admin user
    const adminUser = await prisma.user.findUnique({
      where: { email: 'admin@hrenterprise.com' },
      select: { employeeId: true, id: true },
    });

    if (!adminUser?.employeeId) {
      console.error('❌ Admin user not found');
      return;
    }

    console.log(`✅ Found admin employee ID: ${adminUser.employeeId}\n`);

    // Get all pending leave requests
    const pendingLeaveRequests = await prisma.leaveRequest.findMany({
      where: { status: 'pending' },
      include: {
        employee: {
          select: {
            firstName: true,
            lastName: true,
            employeeCode: true,
          },
        },
      },
    });

    console.log(`📋 Found ${pendingLeaveRequests.length} pending leave requests\n`);

    // Delete existing approvals for these leave requests
    for (const leaveRequest of pendingLeaveRequests) {
      await prisma.approval.deleteMany({
        where: {
          entityType: 'leave_request',
          entityId: leaveRequest.id,
        },
      });
    }

    console.log('🗑️  Deleted old approval records\n');

    // Create new approvals with admin as approver
    for (const leaveRequest of pendingLeaveRequests) {
      const approval = await prisma.approval.create({
        data: {
          entityType: 'leave_request',
          entityId: leaveRequest.id,
          requesterId: leaveRequest.employeeId,
          approverId: adminUser.employeeId,
          status: 'pending',
          totalSteps: 1,
          currentStep: 1,
          comments: `Leave request for ${leaveRequest.days} day(s) from ${leaveRequest.startDate.toLocaleDateString()} to ${leaveRequest.endDate.toLocaleDateString()}`,
          steps: {
            create: {
              stepNumber: 1,
              approverId: adminUser.employeeId,
              status: 'pending',
            },
          },
        },
      });

      console.log(
        `✅ Created approval for ${leaveRequest.employee.firstName} ${leaveRequest.employee.lastName} (${leaveRequest.employee.employeeCode})`,
      );
    }

    console.log(`\n🎉 Successfully updated ${pendingLeaveRequests.length} leave approvals!`);
    console.log('\n📊 Summary:');
    console.log(`   • Admin approver: ${adminUser.employeeId}`);
    console.log(`   • Pending leave requests: ${pendingLeaveRequests.length}`);
    console.log(`   • Approvals created: ${pendingLeaveRequests.length}`);
  } catch (error) {
    console.error('❌ Error updating leave approvals:', error);
    throw error;
  }
}

updateLeaveApprovals()
  .catch((e) => {
    console.error('❌ Migration failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
