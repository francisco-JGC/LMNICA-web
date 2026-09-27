import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  listWinningTickets,
  markTicketAsPaid,
} from '@/features/winners/api/winners.api';
import { toApiError } from '@/shared/api/error-mapper';

import type {
  ListWinnersParams,
  Ticket,
  WinningTicket,
} from '@/features/winners/types';
import type { ApiError } from '@/shared/types/api';

export const winnersQueryKeys = {
  all: ['winners'] as const,
  list: (params: ListWinnersParams) =>
    [...winnersQueryKeys.all, 'list', params] as const,
};

export function useWinners(params: ListWinnersParams) {
  return useQuery<WinningTicket[], ApiError>({
    queryKey: winnersQueryKeys.list(params),
    queryFn: async () => {
      try {
        return await listWinningTickets(params);
      } catch (error) {
        throw toApiError(error);
      }
    },
    placeholderData: (prev) => prev,
  });
}

export function useMarkTicketAsPaid() {
  const queryClient = useQueryClient();
  return useMutation<Ticket, ApiError, string>({
    mutationFn: async (ticketId) => {
      try {
        return await markTicketAsPaid(ticketId);
      } catch (error) {
        throw toApiError(error);
      }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: winnersQueryKeys.all });
    },
  });
}
