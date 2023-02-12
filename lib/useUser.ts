import { useEffect } from "react";
import Router from "next/router";
import useSWR from "swr";
import { User } from "../pages/api/user";

export default function useUser() {
  const { data: user, mutate: mutateUser } = useSWR<User>({ url: "/api/user" });
  return { user, mutateUser };
}
