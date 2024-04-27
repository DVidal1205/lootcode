/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import Shop from "~/components/shop";
import { db } from "~/server/db";

export default async function Page() {
  const user = await currentUser();

  if (!user?.id) redirect(`/auth-callback?origin=shop`);

  const dbUser = await db.user.findFirst({
    where: { id: user.id },
  });

  if (!dbUser) {
    redirect(`/auth-callback?origin=shop`);
  }

  return (
    <main className="z-10 flex h-[92.5vh] flex-col items-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
      <Shop name={user.firstName ?? ''} user={dbUser}></Shop>
    </main>
  );
}
