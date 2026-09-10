import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "./supabase/server";
import type { BillbliWork } from "./work-engine";

type WorkRepositoryClient = Pick<SupabaseClient, "from">;

type WorkRepositoryOptions = {
  supabase?: WorkRepositoryClient;
  getAuthenticatedUserId?: () => Promise<string>;
};

type WorkRow = {
  id: string;
  user_id: string;
  title: string;
  goal: string;
  status: BillbliWork["status"];
  priority: BillbliWork["priority"];
  autonomy_level: BillbliWork["autonomy"];
  authorization: BillbliWork["authorization"];
  worker_type: BillbliWork["workerType"];
  worker_name: BillbliWork["workerName"];
  worker_context: BillbliWork["workerContext"];
  created_at: string;
  updated_at: string;
};

function toWork(row: WorkRow): BillbliWork {
  return {
    id: row.id,
    title: row.title,
    goal: row.goal,
    status: row.status,
    priority: row.priority,
    autonomy: row.autonomy_level,
    authorization: row.authorization,
      ...(row.worker_type ? { workerType: row.worker_type } : {}),
      ...(row.worker_name ? { workerName: row.worker_name } : {}),
      ...(row.worker_context ? { workerContext: row.worker_context } : {}),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function createWorkRepository(
  options: WorkRepositoryOptions = {},
) {
  const getSupabase = async (): Promise<WorkRepositoryClient> =>
    options.supabase ?? (await createClient());

  const getUserId = async (): Promise<string> => {
    if (options.getAuthenticatedUserId) {
      return options.getAuthenticatedUserId();
    }

    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      throw new Error("Authentication required");
    }

    return user.id;
  };

  return {
    getAuthenticatedUserId: getUserId,

    async createWork(work: BillbliWork): Promise<BillbliWork> {
      const supabase = await getSupabase();
      const userId = await getUserId();

      const { data, error } = await supabase
        .from("works")
        .insert({
          id: work.id,
          user_id: userId,
          title: work.title,
          goal: work.goal,
          status: work.status,
          priority: work.priority,
          autonomy_level: work.autonomy,
          authorization: work.authorization,
          worker_type: work.workerType ?? null,
            worker_name: work.workerName ?? null,
            worker_context: work.workerContext ?? null,
          created_at: work.createdAt,
          updated_at: work.updatedAt,
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create Work: ${error.message}`);
      }

      return toWork(data as WorkRow);
    },

    async listWorks(): Promise<BillbliWork[]> {
      const supabase = await getSupabase();
      const userId = await getUserId();

      const { data, error } = await supabase
        .from("works")
        .select()
        .eq("user_id", userId);

      if (error) {
        throw new Error(`Failed to list Work: ${error.message}`);
      }

      return (data ?? []).map((row) => toWork(row as WorkRow));
    },

    async getWork(id: string): Promise<BillbliWork | null> {
      const supabase = await getSupabase();
      const userId = await getUserId();

      const { data, error } = await supabase
        .from("works")
        .select()
        .eq("id", id)
        .eq("user_id", userId)
        .single();

      if (error) {
        if (error.message === "Work not found") {
          return null;
        }

        throw new Error(`Failed to load Work: ${error.message}`);
      }

      return toWork(data as WorkRow);
    },
  };
}
