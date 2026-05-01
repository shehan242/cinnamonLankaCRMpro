'use server';
/**
 * @fileOverview This file implements a Genkit flow for summarizing sales and revenue reports.
 *
 * - summarizeReport - A function that handles the report summarization process.
 * - ReportSummaryInput - The input type for the summarizeReport function.
 * - ReportSummaryOutput - The return type for the summarizeReport function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ReportSummaryInputSchema = z.object({
  reportText: z
    .string()
    .describe('The full text content of the sales or revenue report.'),
});
export type ReportSummaryInput = z.infer<typeof ReportSummaryInputSchema>;

const ReportSummaryOutputSchema = z.object({
  summary: z
    .string()
    .describe(
      'A concise natural language summary of the report, highlighting key trends and anomalies.'
    ),
});
export type ReportSummaryOutput = z.infer<typeof ReportSummaryOutputSchema>;

export async function summarizeReport(
  input: ReportSummaryInput
): Promise<ReportSummaryOutput> {
  return reportSummarizationFlow(input);
}

const reportSummarizationPrompt = ai.definePrompt({
  name: 'reportSummarizationPrompt',
  input: {schema: ReportSummaryInputSchema},
  output: {schema: ReportSummaryOutputSchema},
  prompt: `You are a highly skilled business analyst specializing in sales and revenue reports.
Your task is to analyze the provided report text and generate a concise, natural language summary.
The summary must highlight key trends, significant anomalies, and overall business performance metrics.
Focus on providing actionable insights and important changes rather than just reiterating data.

Report Text:
{{{reportText}}}`,
});

const reportSummarizationFlow = ai.defineFlow(
  {
    name: 'reportSummarizationFlow',
    inputSchema: ReportSummaryInputSchema,
    outputSchema: ReportSummaryOutputSchema,
  },
  async input => {
    const {output} = await reportSummarizationPrompt(input);
    return output!;
  }
);
