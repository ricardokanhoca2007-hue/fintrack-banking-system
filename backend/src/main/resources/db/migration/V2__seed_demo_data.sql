
-- Demo user for the FinTrack portfolio application.
-- This account is for demonstration only; authentication is not implemented yet.

INSERT INTO users (
    id,
    first_name,
    last_name,
    email,
    password_hash,
    role,
    status,
    created_at,
    updated_at
)
VALUES (
    '11111111-1111-4111-8111-111111111111',
    'Demo',
    'User',
    'demo@fintrack.local',
    'NOT_A_REAL_PASSWORD_HASH',
    'USER',
    'ACTIVE',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

INSERT INTO accounts (
    id,
    user_id,
    name,
    account_number,
    iban,
    type,
    currency,
    balance,
    status,
    created_at,
    updated_at
)
VALUES
(
    '22222222-2222-4222-8222-222222222221',
    '11111111-1111-4111-8111-111111111111',
    'Conta Corrente',
    'FT-DEMO-0001',
    'PT50000000000000000000001',
    'CURRENT',
    'EUR',
    8420.6500,
    'ACTIVE',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    '22222222-2222-4222-8222-222222222222',
    '11111111-1111-4111-8111-111111111111',
    'Conta Poupança',
    'FT-DEMO-0002',
    'PT50000000000000000000002',
    'SAVINGS',
    'EUR',
    6150.0000,
    'ACTIVE',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    '22222222-2222-4222-8222-222222222223',
    '11111111-1111-4111-8111-111111111111',
    'Conta USD',
    'FT-DEMO-0003',
    'PT50000000000000000000003',
    'CURRENT',
    'USD',
    2290.4000,
    'ACTIVE',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    '22222222-2222-4222-8222-222222222224',
    '11111111-1111-4111-8111-111111111111',
    'Conta GBP',
    'FT-DEMO-0004',
    'PT50000000000000000000004',
    'CURRENT',
    'GBP',
    1180.7500,
    'ACTIVE',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);
