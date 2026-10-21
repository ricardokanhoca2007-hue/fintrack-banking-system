CREATE TABLE users (
    id UUID PRIMARY KEY,
    first_name VARCHAR(80) NOT NULL,
    last_name VARCHAR(80) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(30),
    address VARCHAR(255),
    role VARCHAR(30) NOT NULL DEFAULT 'USER',
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);

CREATE TABLE accounts (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    name VARCHAR(100) NOT NULL,
    account_number VARCHAR(34) NOT NULL UNIQUE,
    iban VARCHAR(34) UNIQUE,
    type VARCHAR(30) NOT NULL,
    currency CHAR(3) NOT NULL,
    balance NUMERIC(19, 4) NOT NULL DEFAULT 0,
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_accounts_user
        FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT chk_accounts_balance_non_negative
        CHECK (balance >= 0)
);

CREATE INDEX idx_accounts_user_id ON accounts(user_id);

CREATE TABLE categories (
    id VARCHAR(40) PRIMARY KEY,
    label VARCHAR(100) NOT NULL,
    emoji VARCHAR(16),
    active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE transactions (
    id UUID PRIMARY KEY,
    reference VARCHAR(40) NOT NULL UNIQUE,
    source_account_id UUID,
    destination_account_id UUID,
    type VARCHAR(30) NOT NULL,
    status VARCHAR(30) NOT NULL,
    category_id VARCHAR(40),
    description VARCHAR(255),
    amount NUMERIC(19, 4) NOT NULL,
    currency CHAR(3) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMPTZ,
    CONSTRAINT chk_transactions_amount_positive CHECK (amount > 0),
    CONSTRAINT fk_transactions_source
        FOREIGN KEY (source_account_id) REFERENCES accounts(id),
    CONSTRAINT fk_transactions_destination
        FOREIGN KEY (destination_account_id) REFERENCES accounts(id),
    CONSTRAINT fk_transactions_category
        FOREIGN KEY (category_id) REFERENCES categories(id)
);

CREATE INDEX idx_transactions_source_account_id ON transactions(source_account_id);
CREATE INDEX idx_transactions_destination_account_id ON transactions(destination_account_id);
CREATE INDEX idx_transactions_created_at ON transactions(created_at);
CREATE INDEX idx_transactions_category_id ON transactions(category_id);

INSERT INTO categories (id, label, emoji) VALUES
    ('SALARY', 'Salário', '💰'),
    ('GROCERIES', 'Alimentação', '🍔'),
    ('TRANSPORT', 'Transporte', '🚗'),
    ('HOUSING', 'Habitação', '🏠'),
    ('LEISURE', 'Lazer', '🎬'),
    ('HEALTH', 'Saúde', '🩺'),
    ('SHOPPING', 'Compras', '🛍️'),
    ('TECH', 'Tecnologia', '💻'),
    ('EDUCATION', 'Educação', '🎓'),
    ('SUBSCRIPTIONS', 'Subscrições', '📺'),
    ('TRANSFER', 'Transferência', '🔁');

