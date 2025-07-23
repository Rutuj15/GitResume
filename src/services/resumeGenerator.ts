import OpenAI from 'openai';
import { CodeSnippet } from './gitAnalyzer';

export interface ResumeBullet {
    content: string;
    confidence: number;
    tags: string[];
}

export class ResumeGenerator {
    private openai: OpenAI;

    constructor(apiKey: string) {
        this.openai = new OpenAI({ apiKey });
    }

    async generateBullets(
        snippets: CodeSnippet[],
        style: string,
        maxBullets: number
    ): Promise<ResumeBullet[]> {
        const systemPrompt = this.buildSystemPrompt(style);
        const userPrompt = this.buildUserPrompt(snippets);

        try {
            const response = await this.openai.chat.completions.create({
                model: 'gpt-4o-mini',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt }
                ],
                temperature: 0.7,
                max_tokens: 2000,
                response_format: { type: 'json_object' }
            });

            const content = response.choices[0].message.content;
            if (!content) throw new Error('No response from AI');

            const result = JSON.parse(content);
            return result.bullets || [];

        } catch (error: any) {
            throw new Error(`AI generation failed: ${error.message}`);
        }
    }

    private buildSystemPrompt(style: string): string {
        const basePrompt = `You are an expert technical resume writer. Analyze code contributions and generate impactful resume bullet points.

Requirements:
- Start with strong action verbs (Developed, Implemented, Optimized, etc.)
- Include specific technologies and technical details
- Quantify impact when possible
- Focus on business value and outcomes
- Be concise but specific

Return JSON format:
{
  "bullets": [
    {
      "content": "Developed REST API using Node.js and Express, reducing response time by 40%",
      "confidence": 0.9,
      "tags": ["nodejs", "api", "performance"]
    }
  ]
}`;

        const styleGuides: { [key: string]: string } = {
            professional: '\n\nUse formal, achievement-focused language.',
            technical: '\n\nEmphasize technical implementation details and technologies.',
            startup: '\n\nHighlight innovation, versatility, and rapid development.',
            academic: '\n\nFocus on algorithms, research aspects, and theoretical contributions.'
        };

        return basePrompt + (styleGuides[style] || styleGuides.professional);
    }

    private buildUserPrompt(snippets: CodeSnippet[]): string {
        let prompt = 'Based on these code contributions, generate resume bullet points:\n\n';

        snippets.forEach((snippet, index) => {
            prompt += `### Contribution ${index + 1}\n`;
            prompt += `File: ${snippet.filePath}\n`;
            prompt += `Language: ${snippet.language}\n`;
            prompt += `Commit: ${snippet.commitMessage}\n`;
            prompt += `Changes: +${snippet.additions} -${snippet.deletions}\n`;
            prompt += `Sample Code:\n\`\`\`${snippet.language}\n${snippet.content}\n\`\`\`\n\n`;
        });

        prompt += `\nGenerate up to ${snippets.length} impactful resume bullets based on these contributions.`;
        return prompt;
    }
}