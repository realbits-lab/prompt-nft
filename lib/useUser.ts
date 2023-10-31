import useSWR from "swr";
import { User } from "@/types/user";

export default function useUser() {
  console.log("call useUser()");

  const { data: user, mutate: mutateUser } = useSWR<User>({ url: "/api/user" });
  console.log("user: ", user);

  return { user, mutateUser };
}
