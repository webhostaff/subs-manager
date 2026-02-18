import { PrismaClient } from "@prisma/client";
import { addDays } from "date-fns";

const prisma = new PrismaClient();

async function main() {
  // Create sample group + 7 customers + memberships
  const group = await prisma.group.upsert({
    where: { name: "G-A" },
    update: {},
    create: { name: "G-A", planDays: 30 },
  });

  const now = new Date();
  const customers = [];
  for (let i = 1; i <= 7; i++) {
    const c = await prisma.customer.create({
      data: {
        fullName: `Customer ${i}`,
        email: `c${i}@example.com`,
        contactType: "WHATSAPP",
        contactValue: `+2160000000${i}`,
      },
    });
    customers.push(c);
  }

  // Some memberships expiring soon to show alerts
  for (let i = 0; i < customers.length; i++) {
    const end = i < 2 ? addDays(now, 1) : i < 4 ? addDays(now, 2) : addDays(now, 12);
    await prisma.membership.create({
      data: {
        groupId: group.id,
        customerId: customers[i].id,
        startDate: addDays(end, -30),
        endDate: end,
        notes: i === 0 ? "Test expiring tomorrow" : null,
      },
    });
  }
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
