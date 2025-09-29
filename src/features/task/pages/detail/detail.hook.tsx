"use client";

import { useTaskDetailQuery } from "@/features/task/hooks";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";

export const useTaskDetail = () => {
  const { taskId } = useParams();
  const { replace } = useRouter();
  const { data: task, error } = useTaskDetailQuery(String(taskId));

  useEffect(() => {
    if (error) {
      replace("/panel/tasks");
    }
  }, [error, replace]);

  return { task };
};
