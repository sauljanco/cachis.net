ALTER TABLE cachis.listings DROP CONSTRAINT listings_currency_check;
ALTER TABLE cachis.listings ADD CONSTRAINT listings_currency_check CHECK (currency IN ('BOB','USD'));
