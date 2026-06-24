const { importProductsFromSite } = require("../src/products/import-from-site");

importProductsFromSite()
  .then(result => {
    console.log(`Imported ${result.products} products and ${result.areas} therapeutic areas.`);
    process.exit(0);
  })
  .catch(error => {
    console.error("Product import failed.");
    console.error(error);
    process.exit(1);
  });
