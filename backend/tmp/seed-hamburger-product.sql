BEGIN;

INSERT INTO "Categories" ("Id", "ParentCategoryId", "Slug", "IsActive", "SortOrder", "ImageUrl", "CreatedAt", "UpdatedAt")
VALUES ('3c1bbcff-8b17-45d5-8455-78f563f7cbd2', NULL, 'hamburger-boxes', TRUE, 1, NULL, NOW(), NOW());

INSERT INTO "CategoryTranslations" ("Id", "CategoryId", "LanguageCode", "Name", "Description", "SeoTitle", "SeoDescription", "CreatedAt", "UpdatedAt")
VALUES
('7d921d2b-5126-4a6d-ae6b-01ba4abeb0ca', '3c1bbcff-8b17-45d5-8455-78f563f7cbd2', 'en', 'Hamburger Boxes', 'Burger boxes and takeaway packaging for restaurant brands.', 'Hamburger Boxes', 'Burger boxes and takeaway packaging.', NOW(), NOW()),
('bc9d0b69-9f8c-4232-9ee5-0d7ec7d0adf3', '3c1bbcff-8b17-45d5-8455-78f563f7cbd2', 'tr', 'Hamburger Kutulari', 'Restoran ve paket servis markalari icin hamburger kutulari.', 'Hamburger Kutulari', 'Restoran ve paket servis icin hamburger kutulari.', NOW(), NOW());

INSERT INTO "Products" (
  "Id", "CategoryId", "Slug", "SkuRoot", "ProductType", "IsActive", "IsFeatured", "IsCustomizable", "HasVariants", "RequiresArtwork",
  "MinOrderQuantity", "MaxOrderQuantity", "LeadTimeDays", "BaseVatRate", "WeightGrams", "MaterialSummary", "OriginCountry",
  "Recyclable", "FoodSafe", "CreatedAt", "UpdatedAt"
)
VALUES (
  'f4b6eebf-62b1-449b-a4bc-47c4b793b07f', '3c1bbcff-8b17-45d5-8455-78f563f7cbd2', 'hamburger-box-with-logo-all-sizes', 'BURGER-LOGO', 2, TRUE, TRUE, TRUE, TRUE, TRUE,
  1, NULL, 3, 20.00, NULL, 'Customizable burger boxes. Sturdy enough for hot and greasy foods, with a steam vent.', 'DE',
  TRUE, TRUE, NOW(), NOW()
);

INSERT INTO "ProductTranslations" ("Id", "ProductId", "LanguageCode", "Name", "ShortDescription", "Description", "SeoTitle", "SeoDescription", "CreatedAt", "UpdatedAt")
VALUES
('0d45672c-5a2f-499d-8acf-a7d467d9ca75', 'f4b6eebf-62b1-449b-a4bc-47c4b793b07f', 'en', 'Hamburger box with logo - All sizes', 'Customizable burger boxes. Sturdy enough for hot and greasy foods, with a steam vent.', 'Custom printed hamburger box for takeaway and restaurant brands. Suitable for hot and greasy foods, with steam vent support and multiple size and color options.', 'Hamburger box with logo - All sizes', 'Custom printed hamburger boxes for takeaway and restaurant brands.', NOW(), NOW()),
('8c26d2e6-4f2c-420a-963d-c1d86cb5a8d6', 'f4b6eebf-62b1-449b-a4bc-47c4b793b07f', 'tr', 'Logolu hamburger kutusu - tum olculer', 'Sicak ve yagli urunler icin uygun, buhar delikli, ozellestirilebilir hamburger kutusu.', 'Paket servis ve restoran markalari icin ozel baskili hamburger kutusu. Sicak ve yagli urunler icin dayanikli, buhar cikisina uygun ve farkli olcu secenekleriyle sunulabilir.', 'Logolu hamburger kutusu - tum olculer', 'Takeaway ve restoran markalari icin ozel baskili hamburger kutulari.', NOW(), NOW());

INSERT INTO "ProductVariants" ("Id", "ProductId", "Sku", "Barcode", "PriceExclVat", "CompareAtPriceExclVat", "StockQuantity", "ReservedStockQuantity", "IsActive", "SortOrder", "CreatedAt", "UpdatedAt")
VALUES
('0cac8064-22dd-4d9c-8669-a2914138154f', 'f4b6eebf-62b1-449b-a4bc-47c4b793b07f', 'BURGER-LOGO-12X12X10-BRN', NULL, 0.34, NULL, 10000, 0, TRUE, 1, NOW(), NOW());

INSERT INTO "ProductAttributes" ("Id", "ProductId", "AttributeKey", "AttributeValue", "LanguageCode", "IsFilterable", "SortOrder", "CreatedAt", "UpdatedAt")
VALUES
('9780d1dd-70f1-43c1-bacd-4f8b516227a6', 'f4b6eebf-62b1-449b-a4bc-47c4b793b07f', 'size', '12 x 12 x 10 cm', 'en', TRUE, 1, NOW(), NOW()),
('1a9d18bd-8575-4355-b659-23e3477e814b', 'f4b6eebf-62b1-449b-a4bc-47c4b793b07f', 'color', 'Brown', 'en', TRUE, 2, NOW(), NOW()),
('4a3765f1-f81c-4382-a0ec-92e59188709f', 'f4b6eebf-62b1-449b-a4bc-47c4b793b07f', 'feature', 'With steam holes', 'en', FALSE, 3, NOW(), NOW()),
('8342f5be-1f0d-42aa-9d4d-aad3af4548fd', 'f4b6eebf-62b1-449b-a4bc-47c4b793b07f', 'feature', 'Stable and grease resistant', 'en', FALSE, 4, NOW(), NOW()),
('d7f9c3e6-9709-4404-8570-65ad3a79241f', 'f4b6eebf-62b1-449b-a4bc-47c4b793b07f', 'olcu', '12 x 12 x 10 cm', 'tr', TRUE, 5, NOW(), NOW()),
('286c29f2-98dd-40c2-b61c-3f82db3c29d3', 'f4b6eebf-62b1-449b-a4bc-47c4b793b07f', 'renk', 'Kahverengi', 'tr', TRUE, 6, NOW(), NOW()),
('5fc31be0-f918-4817-a7ab-5ab4199607fc', 'f4b6eebf-62b1-449b-a4bc-47c4b793b07f', 'ozellik', 'Buhar delikli', 'tr', FALSE, 7, NOW(), NOW()),
('f4c0929c-4638-40d6-af66-7dff933dfa58', 'f4b6eebf-62b1-449b-a4bc-47c4b793b07f', 'ozellik', 'Dayanikli ve yag direnci yuksek', 'tr', FALSE, 8, NOW(), NOW());

COMMIT;
