import 'dotenv/config';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Test employees matching auth user IDs
// Using the same IDs as auth users so employee.id matches user.id
const TEST_EMPLOYEES = [
  {
    id: '550e8400-e29b-41d4-a716-446655440000',
    userId: '550e8400-e29b-41d4-a716-446655440000',
    employeeCode: 'EMP001',
    firstName: 'John',
    lastName: 'Doe',
    departmentName: 'Engineering',
    designationTitle: 'Software Engineer',
    joinDate: '2024-01-15',
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    userId: '550e8400-e29b-41d4-a716-446655440001',
    employeeCode: 'EMP002',
    firstName: 'Jane',
    lastName: 'Smith',
    departmentName: 'Human Resources',
    designationTitle: 'HR Manager',
    joinDate: '2023-06-01',
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440002',
    userId: '550e8400-e29b-41d4-a716-446655440002',
    employeeCode: 'EMP003',
    firstName: 'Robert',
    lastName: 'Johnson',
    departmentName: 'Finance',
    designationTitle: 'Financial Analyst',
    joinDate: '2023-03-15',
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440003',
    userId: '550e8400-e29b-41d4-a716-446655440003',
    employeeCode: 'EMP004',
    firstName: 'Emily',
    lastName: 'Davis',
    departmentName: 'Sales',
    designationTitle: 'Sales Executive',
    joinDate: '2024-02-01',
  },
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function main(): Promise<any> {
  console.log('🌱 Starting HR database seed...\n');

  // Debug: Check connection
  console.log('Database URL:', process.env.DATABASE_URL);
  const dbCheck = await pool.query(
    'SELECT current_database(), current_schema()',
  );
  console.log('Connected to:', dbCheck.rows[0]);

  // List all schemas
  const schemas = await pool.query(
    'SELECT schema_name FROM information_schema.schemata',
  );
  console.log(
    'Available schemas:',
    schemas.rows.map((r: { schema_name: string }) => r.schema_name),
  );

  // Ensure hr schema is in search path
  await pool.query('SET search_path TO hr, public');
  console.log('✅ Set search path to hr schema\n');

  // Create departments using raw SQL
  const departments = [
    {
      name: 'Engineering',
      description: 'Software development and technical teams',
    },
    { name: 'Human Resources', description: 'HR and employee management' },
    { name: 'Sales', description: 'Sales and business development' },
    { name: 'Finance', description: 'Financial planning and accounting' },
    { name: 'Marketing', description: 'Marketing and communications' },
  ];

  console.log('Creating departments...');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const createdDepartments: any[] = [];
  for (const dept of departments) {
    try {
      const result = await pool.query(
        'INSERT INTO hr.departments (id, name, description) VALUES (gen_random_uuid(), $1, $2) ON CONFLICT (name) DO UPDATE SET name = $1 RETURNING *',
        [dept.name, dept.description],
      );
      createdDepartments.push(result.rows[0]);
      console.log(`  ✅ ${result.rows[0].name}`);
    } catch (error) {
      console.error(`  ❌ Failed to create ${dept.name}:`, error);
    }
  }
  console.log(`✅ Processed ${createdDepartments.length} departments\n`);

  // Create designations
  const designations = [
    { title: 'Software Engineer' },
    { title: 'Senior Software Engineer' },
    { title: 'Engineering Manager' },
    { title: 'Product Manager' },
    { title: 'HR Manager' },
    { title: 'Sales Executive' },
    { title: 'Financial Analyst' },
    { title: 'Marketing Specialist' },
    { title: 'Team Lead' },
    { title: 'Director' },
  ];

  console.log('Creating designations...');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const createdDesignations: any[] = [];
  for (const desig of designations) {
    try {
      const result = await pool.query(
        'INSERT INTO hr.designations (id, title) VALUES (gen_random_uuid(), $1) ON CONFLICT (title) DO UPDATE SET title = $1 RETURNING *',
        [desig.title],
      );
      createdDesignations.push(result.rows[0]);
      console.log(`  ✅ ${result.rows[0].title}`);
    } catch (error) {
      console.error(`  ❌ Failed to create ${desig.title}:`, error);
    }
  }
  console.log(`✅ Processed ${createdDesignations.length} designations\n`);

  // Create sample employees
  console.log('Creating sample employees...');

  for (const emp of TEST_EMPLOYEES) {
    // Find department
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const department = createdDepartments.find(
      (d: any) => d.name === emp.departmentName,
    );
    // Find designation
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const designation = createdDesignations.find(
      (d: any) => d.title === emp.designationTitle,
    );

    if (!department || !designation) {
      console.error(
        `  ❌ Skipping ${emp.employeeCode}: Department or designation not found`,
      );
      continue;
    }

    try {
      // Check if employee already exists by employee_code
      const existingResult = await pool.query(
        'SELECT id FROM hr.employees WHERE employee_code = $1',
        [emp.employeeCode],
      );

      if (existingResult.rows.length === 0) {
        // Insert new employee with fixed ID (same as user_id)
        await pool.query(
          `INSERT INTO hr.employees (id, user_id, employee_code, first_name, last_name, department_id, designation_id, join_date, status, created_at, updated_at) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'active', NOW(), NOW())
           ON CONFLICT (id) DO UPDATE SET 
             user_id = EXCLUDED.user_id,
             employee_code = EXCLUDED.employee_code,
             first_name = EXCLUDED.first_name,
             last_name = EXCLUDED.last_name,
             department_id = EXCLUDED.department_id,
             designation_id = EXCLUDED.designation_id,
             join_date = EXCLUDED.join_date,
             updated_at = NOW()`,
          [
            emp.id,
            emp.userId,
            emp.employeeCode,
            emp.firstName,
            emp.lastName,
            department.id,
            designation.id,
            emp.joinDate,
          ],
        );
        console.log(
          `✅ Created employee: ${emp.firstName} ${emp.lastName} (${emp.employeeCode}) - ID: ${emp.id}`,
        );
      } else {
        // Update existing employee to ensure ID matches user_id
        await pool.query(
          `UPDATE hr.employees 
           SET id = $1, 
               user_id = $2,
               first_name = $3,
               last_name = $4,
               department_id = $5,
               designation_id = $6,
               join_date = $7,
               updated_at = NOW()
           WHERE employee_code = $8`,
          [
            emp.id,
            emp.userId,
            emp.firstName,
            emp.lastName,
            department.id,
            designation.id,
            emp.joinDate,
            emp.employeeCode,
          ],
        );
        console.log(
          `ℹ️  Updated employee: ${emp.firstName} ${emp.lastName} (${emp.employeeCode}) - ID: ${emp.id}`,
        );
      }
    } catch (error) {
      console.error(
        `❌ Failed to create/update employee ${emp.employeeCode}:`,
        error,
      );
    }
  }

  console.log('\n🎉 Seed completed successfully!');
  await pool.end();
}

main().catch((e) => {
  console.error('❌ Seed failed:', e);
  process.exit(1);
});
