import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createWorkflowApprovalsForLeaveRequests() {
  console.log('🔄 Creating workflow approvals for existing leave requests...\n');

  try {
    // Get admin user
    const adminUser = await prisma.user.findUnique({
      where: { email: 'admin@hrenterprise.com' },
      select: { employeeId: true },
    });

    if (!adminUser?.employeeId) {
      console.error('❌ Admin user not found or has no employee ID');
      process.exit(1);
    }

    console.log(`✅ Found admin employee ID: ${adminUser.employeeId}\n`);

    // Get all pending leave requests
    let pendingLeaveRequests = await prisma.leaveRequest.findMany({
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

    if (pendingLeaveRequests.length === 0) {
      console.log('ℹ️  No pending leave requests found. Creating a sample one...\n');
      
      // Get an employee to create a leave request for
      const employee = await prisma.employee.findFirst({
        where: { 
          employmentStatus: 'active',
          employeeCode: { not: 'EMP001' } // Not admin
        },
      });

      if (!employee) {
        console.error('❌ No employees found to create leave request');
        process.exit(1);
      }

      // Get a leave type
      const leaveType = await prisma.leaveType.findFirst({
        where: { name: 'Annual Leave' },
      });

      if (!leaveType) {
        console.error('❌ No leave types found');
        process.exit(1);
      }

      // Create a sample leave request
      const today = new Date();
      const startDate = new Date(today);
      startDate.setDate(startDate.getDate() + 7);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 2);

      const newLeaveRequest = await prisma.leaveRequest.create({
        data: {
          employeeId: employee.id,
          leaveTypeId: leaveType.id,
          startDate,
          endDate,
          days: 3,
          reason: 'Sample leave request for testing workflow approvals',
          status: 'pending',
        },
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

      pendingLeaveRequests = [newLeaveRequest];
      console.log(`✅ Created sample leave request for ${employee.firstName} ${employee.lastName}\n`);
    }

    // Delete existing approvals for these leave requests to avoid duplicates
    for (const leaveRequest of pendingLeaveRequests) {
      await prisma.approval.deleteMany({
        where: {
          entityType: 'leave_request',
          entityId: leaveRequest.id,
        },
      });
    }

    console.log('🗑️  Cleaned up old approval records\n');

    // Create new approvals with admin as approver
    let created = 0;
    for (const leaveRequest of pendingLeaveRequests) {
      await prisma.approval.create({
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
        `✅ Created approval for ${leaveRequest.employee.firstName} ${leaveRequest.employee.lastName} (${leaveRequest.employee.employeeCode}) - Request ID: ${leaveRequest.id}`,
      );
      created++;
    }

    console.log(`\n🎉 Successfully created ${created} workflow approvals!`);
    console.log('\n📊 Summary:');
    console.log(`   • Admin approver: ${adminUser.employeeId}`);
    console.log(`   • Pending leave requests: ${pendingLeaveRequests.length}`);
    console.log(`   • Workflow approvals created: ${created}`);
    console.log('\n✅ You can now view these approvals at: http://localhost:5173/workflow/approvals');
    console.log('\n🔄 Please refresh the approvals page to see the new data!');
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
}

createWorkflowApprovalsForLeaveRequests()
  .catch((e) => {
    console.error('❌ Script failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
