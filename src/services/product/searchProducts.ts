import ProductCollection, { IProductDocument } from '../../models/products';
import generateEmbedding from '../../utils/openai/generateEmbedding';
import { VECTOR_INDEX_NAME } from '../../constants';

const searchProducts = async (
  searchText: string
): Promise<IProductDocument[]> => {
  try {
    // Generate Embedding
    const embedding = await generateEmbedding(searchText);
    // TODO
    // Add OpenAI GPT Helper
    const collection = await ProductCollection();
    // Query DB
    const aggCursor = collection.aggregate<IProductDocument>([
      {
        $vectorSearch: {
          index: VECTOR_INDEX_NAME,
          path: 'embedding',
          queryVector: embedding,
          numCandidates: 150,
          limit: 2,
        },
      },
      // { $match: { category: 'Electronics', price: { $lte: 200 } } },
      {
        $project: {
          _id: 1,
          name: 1,
          category: 1,
          description: 1,
          price: 1,
          score: { $meta: 'vectorSearchScore' },
        },
      },
    ]);
    const products: IProductDocument[] = [];
    // Print the aggregated results
    for await (const doc of aggCursor) {
      products.push(doc);
    }
    return products;
  } catch (error) {
    throw error;
  }
};

export default searchProducts;
