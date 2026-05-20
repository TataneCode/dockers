CREATE TABLE IF NOT EXISTS powers (
    id          VARCHAR(64)  NOT NULL,
    name        VARCHAR(200) NOT NULL,
    description VARCHAR(500) NOT NULL,
    type        VARCHAR(100) NOT NULL,
    level       INT          NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS heroes (
    id     VARCHAR(64)  NOT NULL,
    name   VARCHAR(200) NOT NULL,
    alias  VARCHAR(200) NOT NULL,
    origin VARCHAR(300) NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS hero_powers (
    hero_id  VARCHAR(64) NOT NULL,
    power_id VARCHAR(64) NOT NULL,
    position INT         NOT NULL,
    PRIMARY KEY (hero_id, power_id),
    INDEX idx_hero_powers_hero_position (hero_id, position),
    INDEX idx_hero_powers_power (power_id),
    CONSTRAINT fk_hero_powers_hero
        FOREIGN KEY (hero_id) REFERENCES heroes (id) ON DELETE CASCADE,
    CONSTRAINT fk_hero_powers_power
        FOREIGN KEY (power_id) REFERENCES powers (id) ON DELETE CASCADE
);
