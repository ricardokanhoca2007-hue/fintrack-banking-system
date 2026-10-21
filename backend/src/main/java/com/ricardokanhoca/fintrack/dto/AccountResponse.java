
package com.ricardokanhoca.fintrack.dto;

import com.ricardokanhoca.fintrack.entity.Account;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

public record AccountResponse(
        UUID id,
        String name,
        String accountNumber,
        BigDecimal balance,
        String currency,
        String type,
        String status,
        OffsetDateTime createdAt
) {
    public static AccountResponse from(Account account) {
        return new AccountResponse(
                account.getId(),
                account.getName(),
                account.getAccountNumber(),
                account.getBalance(),
                account.getCurrency(),
                account.getType().name(),
                account.getStatus().name(),
                account.getCreatedAt()
        );
    }
}
