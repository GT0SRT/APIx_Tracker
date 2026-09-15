require('dotenv').config();
const bcrypt = require('bcryptjs');
const prisma = require('../src/lib/prisma');

async function seedAdmin() {
  console.log('[SeedAdmin] Initializing Admin account provisioning...');

  const adminEmail = process.env.ADMIN_EMAIL ? process.env.ADMIN_EMAIL.toLowerCase().trim() : null;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    console.error('[SeedAdmin] Missing configuration: ADMIN_EMAIL and ADMIN_PASSWORD must be set in your .env file.');
    process.exit(1);
  }

  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: adminEmail },
    });

    // Generate bcrypt salt and hash (10 salt rounds)
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(adminPassword, saltRounds);

    if (existingUser) {
      console.log(`[SeedAdmin] Admin account (${adminEmail}) already exists. Updating credentials...`);
      const updatedUser = await prisma.user.update({
        where: { email: adminEmail },
        data: {
          password_hash: passwordHash,
          role: 'ADMIN',
        },
      });
      console.log(`[SeedAdmin] Successfully synchronized Admin account ID: ${updatedUser.id} (${updatedUser.email}).`);
    } else {
      console.log(`[SeedAdmin] Creating first Admin account (${adminEmail})...`);
      const newUser = await prisma.user.create({
        data: {
          email: adminEmail,
          password_hash: passwordHash,
          role: 'ADMIN',
        },
      });
      console.log(`[SeedAdmin] Successfully created Admin account ID: ${newUser.id} (${newUser.email}).`);
    }

    console.log('[SeedAdmin] Admin credentials provisioned successfully.');
  } catch (error) {
    console.error('[SeedAdmin] Failed to provision Admin account:', error);
    process.exit(1);
  } finally {
    if (prisma && prisma.$disconnect) {
      await prisma.$disconnect();
    }
  }
}

// Execute if run directly
if (require.main === module) {
  seedAdmin()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = seedAdmin;
