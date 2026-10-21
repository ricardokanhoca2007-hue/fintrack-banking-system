
package com.ricardokanhoca.fintrack.api;

import com.ricardokanhoca.fintrack.dto.AccountResponse;
import com.ricardokanhoca.fintrack.repository.AccountRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/accounts")
public class AccountController {

    private final AccountRepository accountRepository;

    public AccountController(AccountRepository accountRepository) {
        this.accountRepository = accountRepository;
    }

    @GetMapping
    public List<AccountResponse> getAccounts() {
        return accountRepository.findAll()
                .stream()
                .map(AccountResponse::from)
                .toList();
    }
}
