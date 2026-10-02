import { createClient } from "@/lib/supabase/server";

export type StaffMember = {
  id: string;
  email?: string | null;
  name?: string | null;
  role?: string | null;
};

export async function getStaffMember(
  userId: string
): Promise<StaffMember | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("staff")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    console.error("Error fetching staff member:", error);
    return null;
  }

  return data;
}

export async function isStaff(userId: string): Promise<boolean> {
  const staff = await getStaffMember(userId);
  return !!staff;
}

export async function requireStaffRole(
  allowedRoles: string[]
): Promise<StaffMember> {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("Unauthorized: You must be logged in.");
  }

  const { data: staff, error: staffError } = await supabase
    .from("staff")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (staffError) {
    console.error("Error checking staff role:", staffError);
    throw new Error("Unable to verify staff permissions.");
  }

  if (!staff) {
    throw new Error("Forbidden: Staff access required.");
  }

  if (!staff.role || !allowedRoles.includes(staff.role)) {
    throw new Error("Forbidden: Insufficient staff permissions.");
  }

  return staff;
}
