import { ArxivTaxonomyCrawler } from './fetchTaxonomy';
import fs from 'fs';


(async () => {
    const crawler = new ArxivTaxonomyCrawler('https://arxiv.org/category_taxonomy');
    const taxonomy = await crawler.getTaxonomy();
    
    // Save the taxonomy data to a JSON file
    fs.writeFileSync('./taxonomy.json', JSON.stringify(taxonomy, null, 2));
    console.log("Taxonomy saved to taxonomy.json");
  })();