import { useParams } from "react-router";
import { useFetch } from "@/_shared/queryProvider";
import { getOrder } from "../api";
import type { IOrderDetailResponse } from "../types";

export function useOrderDetail() {
  const { id } = useParams();

  const { data: order, isLoading, isError, refetch } = useFetch<IOrderDetailResponse>({
    queryKey: getOrder.queryKey(id),
    url: getOrder.url(id),
  });

  return { orderId: id, order, isLoading, isError, refetch };
}
