"use client";

import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Elements/Sidebar/sidebar.component";
import UserPageContent from "@/components/UserComponents/UserPageContent/userPageContent.component";
import { get_current_user } from "@/utils/query";

type CurrentUserType = {
  documentId: string;
  first_name: string;
  last_name: string;
  company: string;
};

export default function UserPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<CurrentUserType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const jwt = Cookies.get("jwt");
    const documentId = Cookies.get("document");

    if (!jwt || !documentId) {
      router.push("/login");
      return;
    }

    (async () => {
      try {
        const user = await get_current_user(documentId);
        if (!user || !user.vetgroupUsers?.length) {
          router.push("/login");
          return;
        }

        const vetUser = user.vetgroupUsers[0].user;

        setCurrentUser({
          documentId,
          first_name: vetUser.first_name,
          last_name: vetUser.last_name,
          company: vetUser.company,
        });
      } catch  {
        router.push("/login");
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  if (loading || !currentUser) return null;

  return (
    <main className="flex relative">
      <Sidebar current_user={currentUser} />
      <UserPageContent />
    </main>
  );
}
