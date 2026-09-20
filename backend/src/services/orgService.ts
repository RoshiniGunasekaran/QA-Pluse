import { Pool } from "pg";

const pool = new Pool({
  user: "dev",
  password: "devpass",
  host: "localhost",
  port: 5432,
  database: "qa_pulse",
});

// Get all organizations where the user is a member
export async function getOrganizations(
  userId: number
): Promise<Array<{ id: number; name: string }>> {
  const result = await pool.query(
    `
    SELECT o.id, o.name
    FROM organizations o
    INNER JOIN org_members om
      ON o.id = om.org_id
    WHERE om.user_id = $1
    ORDER BY o.id
    `,
    [userId]
  );

  return result.rows;
}

// Create organization and make the user its owner
export async function createOrganization(
  name: string,
  userId: number
): Promise<{ id: number; name: string }> {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const orgResult = await client.query(
      `
      INSERT INTO organizations (name, owner_id)
      VALUES ($1, $2)
      RETURNING id, name
      `,
      [name, userId]
    );

    const organization = orgResult.rows[0];

    await client.query(
      `
      INSERT INTO org_members (org_id, user_id, role)
      VALUES ($1, $2, 'owner')
      `,
      [organization.id, userId]
    );

    await client.query("COMMIT");

    return {
      id: organization.id,
      name: organization.name,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

// Check whether a user belongs to an organization
export async function isUserInOrg(
  userId: number,
  orgId: number
): Promise<boolean> {
  const result = await pool.query(
    `
    SELECT 1
    FROM org_members
    WHERE user_id = $1
      AND org_id = $2
    LIMIT 1
    `,
    [userId, orgId]
  );

  return result.rows.length > 0;
}

// Get all members of an organization
export async function getOrgMembers(
  orgId: number
): Promise<
  Array<{
    userId: number;
    name: string;
    email: string;
    role: string;
  }>
> {
  const result = await pool.query(
    `
    SELECT
      u.id AS "userId",
      u.name,
      u.email,
      om.role
    FROM org_members om
    INNER JOIN users u
      ON om.user_id = u.id
    WHERE om.org_id = $1
    ORDER BY u.name
    `,
    [orgId]
  );

  return result.rows;
}

// Add an existing user to an organization
export async function addMemberToOrg(
  userId: number,
  orgId: number,
  role: string
): Promise<boolean> {
  await pool.query(
    `
    INSERT INTO org_members (org_id, user_id, role)
    VALUES ($1, $2, $3)
    `,
    [orgId, userId, role]
  );

  return true;
}