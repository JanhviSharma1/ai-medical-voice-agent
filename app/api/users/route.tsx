import { db } from "@/config/db";
import { usersTable } from "@/config/schema";
import { currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  const user = await currentUser();
  try {
    // if user already exists
    const users = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, user?.primaryEmailAddress?.emailAddress));

    // if user does not exist
    if (users?.length == 0) {
      const result = await db
        .insert(usersTable)
        .values({
          name: user?.fullName,
          email: user?.primaryEmailAddress?.emailAddress,
          credits: 10,
        })
        .returning({
          id: usersTable.id,
          name: usersTable.name,
          email: usersTable.email,
          credits: usersTable.credits,
        });

      return NextResponse.json(result[0]);
    }
  } catch (e) {
    return NextResponse.json(e);
  }
}
