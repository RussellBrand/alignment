import { make_id } from "./make_id";

type USER_NAME = string & { _brand: "UserName" };
export type USER_ID = string & { _brand: "UserId" };

export type USER = {
  _id: USER_ID;
  name: USER_NAME;
  description: string;
} & { _brand: "User" };

function make_user(name: string, description: string): USER {
  const _id = make_id(name);
  return { _id, name, description } as USER;
}

export const leo = make_user("leo", "choose the left most");
export const linda = make_user("linda", "choose the left most");
export const sally = make_user("sally", "choose the second");
export const robert = make_user("robert", "choose the right most");
export const nathan = make_user("nathan", "has not answered");

export const users: USER[] = [leo, linda, sally, robert, nathan];
