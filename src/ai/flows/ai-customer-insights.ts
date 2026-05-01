'use server';
/**
 * @fileOverview An AI agent for analyzing customer notes and purchase history to classify customers
 * and suggest engagement strategies.
 *
 * - aiCustomerInsights - A function that handles the customer insights generation process.
 * - AICustomerInsightsInput - The input type for the aiCustomerInsights function.
 * - AICustomerInsightsOutput - The return type for the aiCustomerInsights function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PurchaseItemSchema = z.object({
  productName: z.string().describe('The name of the product purchased.'),
  price: z.number().describe('The price of the product.'),
  quantity: z.number().describe('The quantity of the product purchased.'),
  date: z.string().describe('The date of the purchase in YYYY-MM-DD format.'),
});

const AICustomerInsightsInputSchema = z.object({
  customerNotes: z.string().describe('Detailed notes about the customer, including sentiment or specific interactions.'),
  purchaseHistory: z.array(PurchaseItemSchema).describe('A list of past purchases by the customer, including product details and dates.'),
});
export type AICustomerInsightsInput = z.infer<typeof AICustomerInsightsInputSchema>;

const CustomerClassificationSchema = z.union([
  z.literal('VIP'),
  z.literal('Regular'),
  z.literal('At-Risk'),
  z.literal('New'),
]);

const AICustomerInsightsOutputSchema = z.object({
  classification: CustomerClassificationSchema.describe('The classification of the customer (e.g., VIP, Regular, At-Risk, New).'),
  engagementStrategies: z.array(z.string()).describe('A list of suggested personalized engagement strategies for the customer.'),
  reasoning: z.string().describe('An explanation for the classification and the suggested strategies, referencing the provided customer data.'),
});
export type AICustomerInsightsOutput = z.infer<typeof AICustomerInsightsOutputSchema>;

export async function aiCustomerInsights(input: AICustomerInsightsInput): Promise<AICustomerInsightsOutput> {
  return aiCustomerInsightsFlow(input);
}

const aiCustomerInsightsPrompt = ai.definePrompt({
  name: 'aiCustomerInsightsPrompt',
  input: {schema: AICustomerInsightsInputSchema},
  output: {schema: AICustomerInsightsOutputSchema},
  prompt: `You are an expert sales manager specializing in customer relationship management. Your goal is to analyze customer data to classify them and suggest personalized engagement strategies.

Analyze the provided customer notes and purchase history. Based on this information, classify the customer as 'VIP', 'Regular', 'At-Risk', or 'New'. Then, suggest specific, actionable engagement strategies to improve retention and satisfaction. Provide a clear reasoning for your classification and suggestions.

Customer Notes:
{{{customerNotes}}}

Purchase History:
{{#if purchaseHistory}}
{{#each purchaseHistory}}
- Product: {{productName}}, Quantity: {{quantity}}, Price: \${{price}}, Date: {{date}}
{{/each}}
{{else}}
No purchase history available.
{{/if}}

Consider factors such as purchase frequency, total spending, recent activity, and sentiment from notes to determine the classification. For engagement strategies, think about personalized offers, follow-ups, or support actions.`,
});

const aiCustomerInsightsFlow = ai.defineFlow(
  {
    name: 'aiCustomerInsightsFlow',
    inputSchema: AICustomerInsightsInputSchema,
    outputSchema: AICustomerInsightsOutputSchema,
  },
  async (input) => {
    const {output} = await aiCustomerInsightsPrompt(input);
    return output!;
  }
);
