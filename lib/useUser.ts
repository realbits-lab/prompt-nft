import { useEffect } from "react";
import Router from "next/router";
import useSWR from "swr";
import { User } from "user/user";

export default function useUser() {
  const { data: user, mutate: mutateUser } = useSWR<User>("/api/user");

  return { user, mutateUser };
}
