ALTER TABLE cachis.listings DROP CONSTRAINT listings_category_check;
ALTER TABLE cachis.listings ADD CONSTRAINT listings_category_check CHECK (
  category IN ('Motos','Vehículos','Lotes','Casas y departamentos','Electrónicos','Otros')
);
